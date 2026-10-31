package th.lana.print;

import android.os.Build;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.Socket;
import java.net.URL;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;

/* talks to the shop's Apps Script (POST, then follow Google's redirect to read the answer) */
public class Net {
    static boolean tlsDone = false;

    static void tls() {
        if (tlsDone) return; tlsDone = true;
        if (Build.VERSION.SDK_INT >= 21) return;
        try {   /* Android 4.x: TLS 1.2 is there but switched off */
            SSLContext c = SSLContext.getInstance("TLSv1.2"); c.init(null, null, null);
            HttpsURLConnection.setDefaultSSLSocketFactory(new Tls12(c.getSocketFactory()));
        } catch (Exception e) {}
    }

    public static String post(String url, String body) throws Exception {
        tls();
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setInstanceFollowRedirects(false); c.setConnectTimeout(15000); c.setReadTimeout(30000);
        c.setRequestMethod("POST"); c.setDoOutput(true);
        c.setRequestProperty("Content-Type", "text/plain;charset=utf-8");
        OutputStream o = c.getOutputStream(); o.write(body.getBytes("UTF-8")); o.close();
        int code = c.getResponseCode();
        for (int hop = 0; hop < 5 && (code == 301 || code == 302 || code == 303 || code == 307 || code == 308); hop++) {
            String loc = c.getHeaderField("Location"); c.disconnect();
            c = (HttpURLConnection) new URL(loc).openConnection();
            c.setInstanceFollowRedirects(false); c.setConnectTimeout(15000); c.setReadTimeout(30000);
            code = c.getResponseCode();
        }
        InputStream in = code >= 400 ? c.getErrorStream() : c.getInputStream();
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        byte[] buf = new byte[4096]; int n;
        while (in != null && (n = in.read(buf)) > 0) b.write(buf, 0, n);
        c.disconnect();
        if (code >= 400) throw new Exception("HTTP " + code);
        return new String(b.toByteArray(), "UTF-8");
    }

    static class Tls12 extends SSLSocketFactory {
        final SSLSocketFactory d;
        Tls12(SSLSocketFactory d) { this.d = d; }
        Socket on(Socket s) { if (s instanceof SSLSocket) ((SSLSocket) s).setEnabledProtocols(new String[] { "TLSv1.1", "TLSv1.2" }); return s; }
        public String[] getDefaultCipherSuites() { return d.getDefaultCipherSuites(); }
        public String[] getSupportedCipherSuites() { return d.getSupportedCipherSuites(); }
        public Socket createSocket(Socket s, String h, int p, boolean a) throws java.io.IOException { return on(d.createSocket(s, h, p, a)); }
        public Socket createSocket(String h, int p) throws java.io.IOException { return on(d.createSocket(h, p)); }
        public Socket createSocket(String h, int p, InetAddress l, int lp) throws java.io.IOException { return on(d.createSocket(h, p, l, lp)); }
        public Socket createSocket(InetAddress h, int p) throws java.io.IOException { return on(d.createSocket(h, p)); }
        public Socket createSocket(InetAddress h, int p, InetAddress l, int lp) throws java.io.IOException { return on(d.createSocket(h, p, l, lp)); }
    }
}
