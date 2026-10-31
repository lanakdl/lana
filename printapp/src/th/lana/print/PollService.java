package th.lana.print;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.IBinder;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.HashSet;
import java.util.Set;

/* runs in the background on the tablet by the printer: every few seconds asks the shop's system
   for slips of jobs just accepted (on any tablet) and prints them */
public class PollService extends Service {
    static volatile String status = "";
    static volatile boolean running = false;
    Thread worker;
    final Set<String> done = new HashSet<String>();

    public static void start(Context c) {
        Intent i = new Intent(c, PollService.class);
        if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i);
    }
    public static void stop(Context c) { c.stopService(new Intent(c, PollService.class)); }

    @Override public IBinder onBind(Intent i) { return null; }

    @Override public int onStartCommand(Intent intent, int flags, int id) {
        foreground("ปริ้นใบงานอัตโนมัติ: เปิดอยู่");
        if (worker == null) {
            running = true;
            worker = new Thread(new Runnable() { public void run() { loop(); } });
            worker.start();
        }
        return START_STICKY;
    }

    @Override public void onDestroy() { running = false; if (worker != null) worker.interrupt(); worker = null; super.onDestroy(); }

    void foreground(String text) {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            nm.createNotificationChannel(new NotificationChannel("lana", "Lana Print", NotificationManager.IMPORTANCE_LOW));
            b = new Notification.Builder(this, "lana");
        } else b = new Notification.Builder(this);
        PendingIntent pi = PendingIntent.getActivity(this, 0, new Intent(this, MainActivity.class), Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        Notification n = b.setContentTitle("Lana Print").setContentText(text).setSmallIcon(R.drawable.icon).setContentIntent(pi).setOngoing(true).build();
        startForeground(1, n);
    }

    void loop() {
        SharedPreferences p = getSharedPreferences("lana", MODE_PRIVATE);
        while (running) {
            String api = p.getString("api", ""), key = p.getString("key", ""), br = p.getString("branch", ""), mac = p.getString("mac", "");
            try {
                if (api.length() == 0 || key.length() == 0) status = "ยังไม่ได้ตั้งค่าร้าน";
                else if (mac.length() == 0) status = "ยังไม่ได้เลือกเครื่องปริ้น";
                else {
                    JSONObject q = new JSONObject().put("app", "station").put("action", "sPrintQ").put("kiosk", key).put("branch", br);
                    JSONObject r = new JSONObject(Net.post(api, q.toString()));
                    if (!r.optBoolean("ok")) throw new Exception(r.optString("error", "server"));
                    JSONArray list = r.getJSONObject("data").optJSONArray("slips");
                    for (int i = 0; list != null && i < list.length(); i++) {
                        JSONObject s = list.getJSONObject(i);
                        String tag = s.getString("id") + ":" + s.getInt("n");
                        if (!done.contains(tag)) {
                            Printer.send(mac, Slip.escpos(Slip.render(s.getString("text"), p.getInt("width", 384))));
                            done.add(tag);
                            status = "ปริ้นล่าสุด " + new java.text.SimpleDateFormat("HH:mm").format(new java.util.Date());
                        }
                        JSONObject ack = new JSONObject().put("app", "station").put("action", "sPrinted").put("kiosk", key).put("branch", br).put("id", s.getString("id")).put("n", s.getInt("n"));
                        try { Net.post(api, ack.toString()); } catch (Exception x) {}
                    }
                    if (status.length() == 0 || status.startsWith("เชื่อม") || status.startsWith("ยัง")) status = "รอใบงาน…";
                }
            } catch (Exception e) {
                status = "เชื่อมต่อไม่ได้: " + (e.getMessage() == null ? e.toString() : e.getMessage());
            }
            try { Thread.sleep(4000); } catch (InterruptedException e) { break; }
        }
    }
}
