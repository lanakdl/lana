package th.lana.print;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.DashPathEffect;
import android.graphics.Paint;
import android.graphics.Typeface;
import java.util.ArrayList;
import java.util.List;

/* Turns text into a black-and-white picture of the slip. Thai is drawn with the phone's own font,
   so the printer does not need Thai letters. Text that starts with "#LANA1" uses a small layout:
   c|centered   q|BIG QUEUE   k|bold heading   r|left|right   end|big bold   small|tiny   hr */
public class Slip {
    static class Item { String kind, a, b; Item(String k, String a, String b) { kind = k; this.a = a; this.b = b; } }

    public static Bitmap render(String text, int width) {
        List<Item> items = new ArrayList<Item>();
        String[] lines = text.replace("\r", "").split("\n");
        boolean lana = lines.length > 0 && lines[0].trim().equals("#LANA1");
        for (int i = lana ? 1 : 0; i < lines.length; i++) {
            String l = lines[i];
            if (!lana) { items.add(new Item("t", l, "")); continue; }
            String[] p = l.split("\\|", -1);
            String k = p[0];
            items.add(new Item(k, p.length > 1 ? p[1] : "", p.length > 2 ? p[2] : ""));
        }
        float s = width / 384f, pad = 8 * s;
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        paint.setColor(Color.BLACK);
        /* pass 1: measure; pass 2: draw */
        Bitmap bmp = null; Canvas cv = null; float total = 0;
        for (int pass = 0; pass < 2; pass++) {
            float y = pad;
            for (Item it : items) {
                String k = it.kind;
                if (k.equals("hr")) {
                    if (cv != null) {
                        Paint d = new Paint(); d.setColor(Color.BLACK); d.setStrokeWidth(2 * s); d.setStyle(Paint.Style.STROKE);
                        d.setPathEffect(new DashPathEffect(new float[] { 6 * s, 5 * s }, 0));
                        cv.drawLine(pad, y + 6 * s, width - pad, y + 6 * s, d);
                    }
                    y += 14 * s; continue;
                }
                float px = k.equals("q") ? 72 : k.equals("end") ? 34 : k.equals("small") ? 18 : k.equals("k") ? 26 : 22;
                boolean bold = k.equals("q") || k.equals("end") || k.equals("k");
                paint.setTextSize(px * s);
                paint.setTypeface(Typeface.create(Typeface.DEFAULT, bold ? Typeface.BOLD : Typeface.NORMAL));
                float lh = Math.round(px * 1.3f) * s;
                Paint.FontMetrics fm = paint.getFontMetrics();
                if (k.equals("r")) {
                    float lw = it.a.length() > 0 ? Math.min(150 * s, paint.measureText(it.a) + 12 * s) : 0;
                    List<String> right = wrap(paint, it.b, width - pad * 2 - lw);
                    if (cv != null && it.a.length() > 0) { paint.setTextAlign(Paint.Align.LEFT); cv.drawText(it.a, pad, y - fm.ascent, paint); }
                    for (String r : right) {
                        if (cv != null) { paint.setTextAlign(Paint.Align.RIGHT); cv.drawText(r, width - pad, y - fm.ascent, paint); }
                        y += 28 * s;
                    }
                    if (right.isEmpty()) y += 28 * s;
                    continue;
                }
                boolean left = k.equals("k") || k.equals("t");
                for (String w : wrap(paint, it.a, width - pad * 2)) {
                    if (cv != null) {
                        paint.setTextAlign(left ? Paint.Align.LEFT : Paint.Align.CENTER);
                        cv.drawText(w, left ? pad : width / 2f, y - fm.ascent, paint);
                    }
                    y += lh;
                }
            }
            total = y + pad + 30 * s;
            if (pass == 0) {
                bmp = Bitmap.createBitmap(width, (int) Math.ceil(total), Bitmap.Config.ARGB_8888);
                cv = new Canvas(bmp);
                cv.drawColor(Color.WHITE);
            }
        }
        return bmp;
    }

    static List<String> wrap(Paint p, String t, float maxW) {
        List<String> out = new ArrayList<String>();
        if (t == null || t.length() == 0) { out.add(""); return out; }
        String cur = "";
        String[] words = t.split("(?<=\\s)");
        for (String w : words) {
            String n = cur + w;
            if (p.measureText(n) > maxW && cur.trim().length() > 0) { out.add(cur.trim()); cur = w; }
            else cur = n;
        }
        if (cur.trim().length() > 0 || out.isEmpty()) out.add(cur.trim());
        /* very long words (Thai has no spaces): cut by width */
        List<String> res = new ArrayList<String>();
        for (String l : out) {
            while (p.measureText(l) > maxW && l.length() > 1) {
                int k = l.length();
                while (k > 1 && p.measureText(l, 0, k) > maxW) k--;
                res.add(l.substring(0, k)); l = l.substring(k);
            }
            res.add(l);
        }
        return res;
    }

    /* ESC/POS raster commands, sent in bands so small printers do not overflow */
    public static byte[] escpos(Bitmap b) {
        int w = b.getWidth(), h = b.getHeight(), bw = (w + 7) / 8;
        java.io.ByteArrayOutputStream o = new java.io.ByteArrayOutputStream();
        o.write(0x1b); o.write(0x40);
        int[] row = new int[w];
        for (int y0 = 0; y0 < h; y0 += 128) {
            int n = Math.min(128, h - y0);
            o.write(0x1d); o.write(0x76); o.write(0x30); o.write(0);
            o.write(bw & 255); o.write(bw >> 8); o.write(n & 255); o.write(n >> 8);
            for (int y = y0; y < y0 + n; y++) {
                b.getPixels(row, 0, w, 0, y, w, 1);
                byte[] line = new byte[bw];
                for (int x = 0; x < w; x++) {
                    int c = row[x], a = (c >>> 24) & 255;
                    int r = (c >> 16) & 255, g = (c >> 8) & 255, bl = c & 255;
                    float lum = a < 128 ? 255 : r * 0.3f + g * 0.59f + bl * 0.11f;
                    if (lum < 150) line[x >> 3] |= (byte) (0x80 >> (x & 7));
                }
                o.write(line, 0, bw);
            }
        }
        o.write(0x1b); o.write(0x64); o.write(4);
        o.write(0x1d); o.write(0x56); o.write(0x42); o.write(0);
        return o.toByteArray();
    }

    public static Bitmap fit(Bitmap src, int width) {
        if (src.getWidth() == width) return src;
        int h = Math.max(1, Math.round(src.getHeight() * (width / (float) src.getWidth())));
        Bitmap out = Bitmap.createBitmap(width, h, Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(out); c.drawColor(Color.WHITE);
        c.drawBitmap(Bitmap.createScaledBitmap(src, width, h, true), 0, 0, null);
        return out;
    }
}
