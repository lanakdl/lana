package th.lana.print;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.util.UUID;

/* sends bytes to a paired Bluetooth printer (classic SPP); one print at a time across the app */
public class Printer {
    static final UUID SPP = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    static final Object LOCK = new Object();

    public static void send(String mac, byte[] data) throws Exception {
        synchronized (LOCK) {
            BluetoothAdapter ad = BluetoothAdapter.getDefaultAdapter();
            if (ad == null || !ad.isEnabled()) throw new Exception("บลูทูธปิดอยู่");
            BluetoothDevice d = ad.getRemoteDevice(mac);
            try { ad.cancelDiscovery(); } catch (Exception e) {}
            BluetoothSocket s = null;
            try { s = d.createRfcommSocketToServiceRecord(SPP); s.connect(); }
            catch (Exception e1) {
                try { if (s != null) s.close(); } catch (Exception x) {}
                Method m = d.getClass().getMethod("createRfcommSocket", new Class[] { int.class });
                s = (BluetoothSocket) m.invoke(d, Integer.valueOf(1));
                s.connect();
            }
            try {
                OutputStream o = s.getOutputStream();
                for (int i = 0; i < data.length; i += 1024) {
                    o.write(data, i, Math.min(1024, data.length - i)); o.flush();
                    Thread.sleep(30);
                }
                Thread.sleep(600 + data.length / 30);
            } finally { try { s.close(); } catch (Exception x) {} }
        }
    }
}
