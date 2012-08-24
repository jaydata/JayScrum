package com.jaystack.jayscrum;

import java.util.concurrent.ExecutionException;

import net.robotmedia.billing.BillingController;
import net.robotmedia.billing.BillingController.BillingStatus;
import net.robotmedia.billing.BillingRequest.ResponseCode;
import net.robotmedia.billing.helper.AbstractBillingObserver;
import net.robotmedia.billing.model.Transaction.PurchaseState;

import org.apache.cordova.DroidGap;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;

import android.os.Bundle;
import android.util.Log;

public class MainActivity extends DroidGap implements BillingController.IConfiguration {
	protected AbstractBillingObserver mBillingObserver;
	public static MainActivity eInstance = null;
	protected InAppBillingPlugin _plugin;
	
	@Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        eInstance = this;
        mBillingObserver = new AbstractBillingObserver(this) {

			public void onBillingChecked(boolean supported) {
				MainActivity.this.onBillingChecked(supported);
			}
			
			public void onSubscriptionChecked(boolean supported) {
				MainActivity.this.onSubscriptionChecked(supported);
			}

			public void onPurchaseStateChanged(String itemId, PurchaseState state) {
				MainActivity.this.onPurchaseStateChanged(itemId, state);
			}

			public void onRequestPurchaseResponse(String itemId, ResponseCode response) {
				MainActivity.this.onRequestPurchaseResponse(itemId, response);
			}
		};
		BillingController.setDebug(true);
		BillingController.registerObserver(mBillingObserver);
		BillingController.setConfiguration(this); // This activity will provide
		// the public key and salt
		this.checkBillingSupported();
		if (!mBillingObserver.isTransactionsRestored()) {
			BillingController.restoreTransactions(this);
		}
        
        super.loadUrl("file:///android_asset/www/index.html");
    }
	
	public void onBillingChecked(boolean supported){
		Log.d("InApp", "onBlillingChecked supported: "+supported);
	};
	
	public void onSubscriptionChecked(boolean supported){
		Log.d("InApp", "onSubscriptionChecked supported: "+supported);
	};
	
	public void onPurchaseStateChanged(String itemId, PurchaseState state){
		Log.d("InApp", "onPurchaseStateChanged itemId: "+itemId+" state: "+state.toString());
	};

	public void onRequestPurchaseResponse(String itemId, ResponseCode response){
		Log.d("InApp", "!!!! purchase response: "+response.toString());
		try{
			Log.d("InApp", "callback string: "+this._plugin._callbackId);
			PluginResult result = new PluginResult(PluginResult.Status.OK, response.toString());
			result.setKeepCallback(true);
			this._plugin.success(result, this._plugin._callbackId);
		}catch(NullPointerException ex){
			Log.e("InApp", "ex.getMessage()");
		}
	};
	
	public BillingStatus checkBillingSupported() {
		return BillingController.checkBillingSupported(this);
	}
	
	public BillingStatus checkSubscriptionSupported() {
		return BillingController.checkSubscriptionSupported(this);
	}
	
	public void MonthlySubscription(InAppBillingPlugin plugin, String data){
		this._plugin = plugin;
		BillingController.requestSubscription(this, "test.jaystack.subscription_monthly", true, data);
		//BillingController.requestPurchase(this, "android.test.purchased", true, data);
	}
	
	public byte[] getObfuscationSalt() {
		// TODO Auto-generated method stub
		return null;
	}

	public String getPublicKey() {
		// TODO Auto-generated method stub
		return null;
	}
	
	@Override
	public void onDestroy() {
		super.onDestroy();
		BillingController.unregisterObserver(mBillingObserver); // Avoid
																// receiving
		// notifications after
		// destroy
		BillingController.setConfiguration(null);
	}
}
