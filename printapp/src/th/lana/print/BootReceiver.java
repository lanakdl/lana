package th.lana.print;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/* tablet restarted: start printing jobs again by itself */
public class BootReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c, Intent i) {
        if (c.getSharedPreferences("lana", Context.MODE_PRIVATE).getBoolean("auto", false)) PollService.start(c);
    }
}
