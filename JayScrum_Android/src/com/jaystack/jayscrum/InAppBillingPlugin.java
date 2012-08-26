package com.jaystack.jayscrum;

import java.util.List;

import net.robotmedia.billing.BillingController;
import net.robotmedia.billing.BillingController.BillingStatus;
import net.robotmedia.billing.model.Transaction;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;

import android.util.Log;

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
		}else if(action.equals("transactions")){
			List<Transaction> transactions = BillingController.getTransactions(MainActivity.eInstance);
			StringBuilder builder = new StringBuilder();
			for(Transaction t : transactions){
				builder.append(t.productId.toString());
				builder.append(t.purchaseState.toString());
				builder.append(t.developerPayload);
			}
			
			PluginResult result = new PluginResult(PluginResult.Status.OK, builder.toString());
			return result;
		}else if(action.equals("subscribe")){
			this._callbackId = callback;
			PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);
			result.setKeepCallback(true);
			
			Log.d("InApp", "Stating subscription with following data: "+arg1.toString());
			MainActivity.eInstance.MonthlySubscription(this, arg1.toString());
			
			return result;
		}
		
		PluginResult pluginResult = new PluginResult(PluginResult.Status.INVALID_ACTION, "Not valid action: "+action);
		return pluginResult;
	}

}
 