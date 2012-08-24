package com.jaystack.jayscrum;

import net.robotmedia.billing.BillingController;
import net.robotmedia.billing.BillingController.BillingStatus;

import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;

import android.webkit.WebSettings.PluginState;

import com.phonegap.api.Plugin;

public class InAppBillingPlugin extends Plugin {

	public String _callbackId;
	
	@Override
	public PluginResult execute(String action, JSONArray arg1, String callback) {
		if(action.equals("checkSupported")){
			_callbackId = callback;
			BillingStatus status =  MainActivity.eInstance.checkBillingSupported();
			PluginResult result = new PluginResult(PluginResult.Status.OK, status.toString());
			//result.setKeepCallback(true);
			
			return result;
		}else if(action.equals("buy")){
			this._callbackId = callback;
			 MainActivity.eInstance.BuySomething(this);
			PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);
			result.setKeepCallback(true);
			
			return result;
		}
		
		PluginResult pluginResult = new PluginResult(PluginResult.Status.INVALID_ACTION, "Not valuid action");
		return pluginResult;
	}

}
 