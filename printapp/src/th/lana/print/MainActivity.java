package th.lana.print;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/* Lana Print: receives a slip (text or picture) from the Lana page or any app's Share menu
   and prints it on a paired Bluetooth thermal printer. No ads, no internet. */
public class MainActivity extends Activity {
    static final UUID SPP = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    static final int BROWN = Color.rgb(61, 35, 26), OLIVE = Color.rgb(108, 117, 82), PAPER = Color.rgb(247, 241, 234);
    SharedPreferences prefs;
    Handler ui = new Handler();
    LinearLayout box;
    TextView status;
    String lastText = null; Bitmap lastPic = null;
    boolean busy = false, fromShare = false;
    TextView autoText;
    Runnable tick = new Runnable() { public void run() {
        if (autoText != null && prefs.getBoolean("auto", false)) autoText.setText("เปิดอยู่ · " + PollService.status);
        ui.postDelayed(this, 2000); } };
    @Override protected void onResume() { super.onResume(); ui.post(tick); }
    @Override protected void onPause() { ui.removeCallbacks(tick); super.onPause(); }

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        prefs = getSharedPreferences("lana", MODE_PRIVATE);
        ScrollView sv = new ScrollView(this);
        sv.setBackgroundColor(PAPER);
        box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        int p = dp(20); box.setPadding(p, p, p, p);
        sv.addView(box);
        setContentView(sv);
        handle(getIntent());
    }

    @Override protected void onNewIntent(Intent i) { super.onNewIntent(i); setIntent(i); handle(i); }

    void handle(Intent in) {
        lastText = null; lastPic = null; fromShare = false;
        if (in != null && "th.lana.print.SETUP".equals(in.getAction())) {   /* one tap on the station page hands over the shop's address */
            String api = in.getStringExtra("api"), key = in.getStringExtra("key"), br = in.getStringExtra("branch");
            if (api != null && api.length() > 0 && key != null && key.length() > 0) {
                prefs.edit().putString("api", api).putString("key", key).putString("branch", br == null ? "" : br).putBoolean("auto", true).apply();
                PollService.start(this);
            }
        }
        if (prefs.getBoolean("auto", false) && !PollService.running) PollService.start(this);
        if (in != null && Intent.ACTION_SEND.equals(in.getAction())) {
            fromShare = true;
            String t = in.getStringExtra(Intent.EXTRA_TEXT);
            Uri u = (Uri) in.getParcelableExtra(Intent.EXTRA_STREAM);
            if (u != null) {
                try { InputStream is = getContentResolver().openInputStream(u); lastPic = BitmapFactory.decodeStream(is); is.close(); } catch (Exception e) { lastPic = null; }
            }
            if (lastPic == null && t != null) lastText = t;
        }
        draw();
        if (lastText != null || lastPic != null) print();
    }

    int width() { return prefs.getInt("width", 384); }
    String printer() { return prefs.getString("mac", ""); }

    void draw() {
        box.removeAllViews();
        TextView h = text("Lana Print", 26, BROWN, true);
        box.addView(h);
        status = text(fromShare ? "กำลังปริ้น…" : "แอปปริ้นใบงานของ Lana · ไม่มีโฆษณา", 17, Color.DKGRAY, false);
        status.setPadding(0, dp(6), 0, dp(14));
        box.addView(status);
        if (lastText != null || lastPic != null) {
            Button again = button("ปริ้นอีกครั้ง", OLIVE, Color.WHITE);
            again.setOnClickListener(new View.OnClickListener() { public void onClick(View v) { print(); } });
            box.addView(again);
        }
        boolean set = prefs.getString("api", "").length() > 0;
        box.addView(label("ปริ้นใบงานอัตโนมัติ (รับงานที่ iPad แล้วออกที่นี่)"));
        autoText = text(!set ? "ยังไม่ได้ตั้งค่า · เปิดหน้ารับงานบนแท็บเล็ตนี้ แล้วแตะ \"ตั้งแท็บเล็ตปริ้น\" ในหน้าใบงาน" : prefs.getBoolean("auto", false) ? "เปิดอยู่ · " + PollService.status : "ปิดอยู่", 15, Color.DKGRAY, false);
        box.addView(autoText);
        if (set) {
            final boolean on = prefs.getBoolean("auto", false);
            Button ab = button(on ? "ปิดปริ้นอัตโนมัติ" : "เปิดปริ้นอัตโนมัติ", on ? Color.WHITE : OLIVE, on ? BROWN : Color.WHITE);
            ab.setOnClickListener(new View.OnClickListener() { public void onClick(View v) {
                prefs.edit().putBoolean("auto", !on).apply();
                if (on) PollService.stop(MainActivity.this); else PollService.start(MainActivity.this);
                draw(); } });
            box.addView(ab);
        }
        box.addView(label("เครื่องปริ้น"));
        BluetoothAdapter ad = BluetoothAdapter.getDefaultAdapter();
        if (ad == null) { box.addView(text("แท็บเล็ตนี้ไม่มีบลูทูธ", 16, Color.RED, false)); return; }
        if (!ad.isEnabled()) {
            Button on = button("เปิดบลูทูธ", BROWN, Color.WHITE);
            on.setOnClickListener(new View.OnClickListener() { public void onClick(View v) {
                try { startActivityForResult(new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE), 1); } catch (Exception e) { say("เปิดบลูทูธในตั้งค่าเครื่องก่อน", true); } } });
            box.addView(on);
        }
        List<BluetoothDevice> list = new ArrayList<BluetoothDevice>();
        try { Set<BluetoothDevice> s = ad.getBondedDevices(); if (s != null) list.addAll(s); } catch (Exception e) {}
        if (list.isEmpty()) box.addView(text("ยังไม่มีเครื่องที่จับคู่ไว้ · ไปที่ ตั้งค่า › บลูทูธ › จับคู่เครื่องปริ้นก่อน (รหัสมักเป็น 0000 หรือ 1234) แล้วกลับมาหน้านี้", 15, Color.DKGRAY, false));
        for (final BluetoothDevice d : list) {
            final String mac = d.getAddress();
            String nm = d.getName() == null ? mac : d.getName();
            boolean on = mac.equals(printer());
            Button bt = button((on ? "✓ " : "") + nm, on ? BROWN : Color.WHITE, on ? Color.WHITE : BROWN);
            bt.setOnClickListener(new View.OnClickListener() { public void onClick(View v) { prefs.edit().putString("mac", mac).apply(); draw(); say("เลือกเครื่องนี้แล้ว · ลองกด ปริ้นทดสอบ", false); } });
            box.addView(bt);
        }
        box.addView(label("ขนาดกระดาษ"));
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        final int[] ws = { 384, 576 }; String[] wn = { "58 มม. (เล็ก)", "80 มม. (ใหญ่)" };
        for (int i = 0; i < 2; i++) {
            final int w = ws[i];
            Button b = button(wn[i], w == width() ? BROWN : Color.WHITE, w == width() ? Color.WHITE : BROWN);
            b.setOnClickListener(new View.OnClickListener() { public void onClick(View v) { prefs.edit().putInt("width", w).apply(); draw(); } });
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1); lp.setMargins(0, 0, dp(6), 0);
            row.addView(b, lp);
        }
        box.addView(row);
        Button test = button("ปริ้นทดสอบ", OLIVE, Color.WHITE);
        test.setOnClickListener(new View.OnClickListener() { public void onClick(View v) {
            lastPic = null; lastText = "#LANA1\nc|LANA · ทดสอบเครื่องปริ้น\nq|A01\nhr\nr|ภาษาไทย|สปาศีรษะ สระไดร์\nr|English|Head spa 60 min\nhr\nend|ปริ้นได้แล้ว"; print(); } });
        box.addView(test);
        if (lastPic != null || lastText != null) {
            ImageView iv = new ImageView(this);
            iv.setAdjustViewBounds(true);
            iv.setImageBitmap(lastPic != null ? Slip.fit(lastPic, width()) : Slip.render(lastText, width()));
            iv.setBackgroundColor(Color.WHITE);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(dp(260), LinearLayout.LayoutParams.WRAP_CONTENT);
            lp.gravity = Gravity.CENTER_HORIZONTAL; lp.setMargins(0, dp(18), 0, 0);
            box.addView(iv, lp);
        }
        box.addView(text("วิธีใช้: ในหน้ารับงาน กด \"ปริ้น\" แล้วเลือก Lana Print · หรือแชร์ข้อความ/รูปจากแอปไหนก็ได้มาที่ Lana Print", 14, Color.GRAY, false));
    }

    void print() {
        if (busy) return;
        final String mac = pickPrinter();
        if (mac == null) { say("ยังไม่ได้เลือกเครื่องปริ้น · แตะชื่อเครื่องด้านล่าง", true); return; }
        final Bitmap pic = lastPic; final String txt = lastText; final int w = width();
        busy = true; say("กำลังปริ้น…", false);
        new Thread(new Runnable() { public void run() {
            String err = null;
            try {
                Bitmap b = pic != null ? Slip.fit(pic, w) : Slip.render(txt, w);
                Printer.send(mac, Slip.escpos(b));
            } catch (Exception e) { err = e.getMessage() == null ? e.toString() : e.getMessage(); }
            final String fe = err;
            ui.post(new Runnable() { public void run() {
                busy = false;
                if (fe == null) {
                    say("ปริ้นแล้ว ✓", false);
                    if (fromShare) ui.postDelayed(new Runnable() { public void run() { if (!busy) finish(); } }, 1500);
                } else say("ปริ้นไม่ออก: เช็กว่าเครื่องปริ้นเปิดอยู่ กระดาษไม่หมด แล้วกด ปริ้นอีกครั้ง\n(" + fe + ")", true);
            } });
        } }).start();
    }

    String pickPrinter() {
        String mac = printer();
        if (mac.length() > 0) return mac;
        try {   /* only one paired device: use it */
            Set<BluetoothDevice> s = BluetoothAdapter.getDefaultAdapter().getBondedDevices();
            if (s != null && s.size() == 1) { mac = s.iterator().next().getAddress(); prefs.edit().putString("mac", mac).apply(); return mac; }
        } catch (Exception e) {}
        return null;
    }

    void say(String m, boolean bad) { if (status != null) { status.setText(m); status.setTextColor(bad ? Color.rgb(192, 57, 43) : Color.rgb(74, 138, 58)); } }

    @Override protected void onActivityResult(int r, int c, Intent d) { draw(); }

    int dp(int v) { return Math.round(v * getResources().getDisplayMetrics().density); }
    TextView text(String s, int sp, int color, boolean bold) {
        TextView t = new TextView(this); t.setText(s); t.setTextSize(sp); t.setTextColor(color);
        if (bold) t.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        t.setPadding(0, dp(4), 0, dp(4)); return t;
    }
    TextView label(String s) { TextView t = text(s, 15, BROWN, true); t.setPadding(0, dp(18), 0, dp(6)); return t; }
    Button button(String s, int bg, int fg) {
        Button b = new Button(this); b.setText(s); b.setTextSize(18); b.setAllCaps(false);
        b.setBackgroundColor(bg); b.setTextColor(fg); b.setPadding(dp(12), dp(14), dp(12), dp(14));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.setMargins(0, dp(4), 0, dp(4)); b.setLayoutParams(lp);
        return b;
    }
}
