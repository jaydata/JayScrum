package com.jaystack.jayscrum;

import android.os.Bundle;
import android.view.WindowManager;

import org.apache.cordova.*;

public class JayScrum extends DroidGap {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // FULLSCREEN
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FORCE_NOT_FULLSCREEN);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        
        // LOCK PORTRAIT ORIENTATION 
        //super.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        
        // LOAD WEBAPP INTO BROWSER     
        super.loadUrl("file:///android_asset/www/index.html");
    }
}