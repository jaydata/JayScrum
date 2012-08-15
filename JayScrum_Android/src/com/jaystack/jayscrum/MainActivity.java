package com.jaystack.jayscrum;

import android.os.Bundle;
import android.os.Handler;
import android.content.Context;
import android.content.SharedPreferences;
import android.text.Html;
import android.text.SpannableStringBuilder;
import android.util.Log;


import org.apache.cordova.*;
import org.apache.cordova.api.PluginResult;
import org.json.JSONObject;

import com.phonegap.plugin.billing.plugin.BillingService;
import com.phonegap.plugin.billing.plugin.BillingService.RequestPurchase;
import com.phonegap.plugin.billing.plugin.BillingService.RestoreTransactions;
import com.phonegap.plugin.billing.plugin.CallbackBillingPlugin;
import com.phonegap.plugin.billing.plugin.Consts;
import com.phonegap.plugin.billing.plugin.Consts.PurchaseState;
import com.phonegap.plugin.billing.plugin.Consts.ResponseCode;
import com.phonegap.plugin.billing.plugin.PurchaseObserver;
import com.phonegap.plugin.billing.plugin.ResponseHandler;




public class MainActivity extends DroidGap {
	public static final String TAG = "CallbackBillingActivity";
	public static MainActivity eInstance = null;
	// Variable for Billing
    private CallbackBillingPlugin _pluginReference = null;
    private Handler mHandler;
    private CallbackPurchaseObserver mCallbackPurchaseObserver;
    private BillingService mBillingService;
    private static final int DIALOG_CANNOT_CONNECT_ID = 1;
    private static final int DIALOG_BILLING_NOT_SUPPORTED_ID = 2;
    private boolean isBillingSupported = false;
    private String mSku;
    private String mPayloadContents = null;
    		
	private class CallbackPurchaseObserver extends PurchaseObserver {
        public CallbackPurchaseObserver(Handler handler) {
            super(MainActivity.this, handler);
        }

        @Override
        public void onBillingSupported(boolean supported) {
            if (Consts.DEBUG) {
                Log.i(TAG, "supported: " + supported);
            }
            if (supported) {
            	// save a flag here to indicate that this app support in app billing
            	isBillingSupported = true;
            	//restoreDatabase();
            } else {
            	Log.d(TAG, "In App Billing not supported");
                //showDialog(DIALOG_BILLING_NOT_SUPPORTED_ID);
            }
        }

        @Override
        public void onPurchaseStateChange(PurchaseState purchaseState, String itemId, int quantity, long purchaseTime, String developerPayload) {
        	//fireJavaScriptEvent("onPurchaseStateChange", "");

        	try {
        		JSONObject oResult = new JSONObject();
                oResult.put("event", "onPurchaseStateChange");
                
                if (Consts.DEBUG) {
                    Log.i(TAG, "onPurchaseStateChange() itemId: " + itemId + " " + purchaseState);
                }

               if (developerPayload == null) {
                    logProductActivity(itemId, purchaseState.toString());
                } else {
                    logProductActivity(itemId, purchaseState + "\n\t" + developerPayload);
                }

                if (purchaseState == PurchaseState.PURCHASED) {
                    //mOwnedItems.add(itemId);
                    oResult.put("purchaseState", "PURCHASED");
                } else if (purchaseState == PurchaseState.CANCELED) {
                    oResult.put("purchaseState", "CANCELED");
                } else if (purchaseState == PurchaseState.REFUNDED) {
                    oResult.put("purchaseState", "REFUNDED");
                }
                //mCatalogAdapter.setOwnedItems(mOwnedItems);
                //mOwnedItemsCursor.requery();
                
                // TODO: Send back the event to javascript
                if (_pluginReference != null) {
                    PluginResult result = new PluginResult(PluginResult.Status.OK, oResult.toString());
                    result.setKeepCallback(false);
                    _pluginReference.success(result, _pluginReference.getCallbackId());
                    _pluginReference.resetCallbackId();
                    _pluginReference = null;
                }
        	} catch (Exception e) {
				// TODO: handle exception
			}
        }

        @Override
        public void onRequestPurchaseResponse(RequestPurchase request, ResponseCode responseCode) {
        	//fireJavaScriptEvent("onRequestPurchaseResponse", "");
        	Log.d(TAG, "!!! onRequestPurchaseResponse call");
        	try {
	            JSONObject oResult = new JSONObject();
                oResult.put("event", "onRequestPurchaseResponse");
                
	            if (Consts.DEBUG) {
	                Log.d(TAG, request.mProductId + ": " + responseCode);
	            }
	            if (responseCode == ResponseCode.RESULT_OK) {
	                oResult.put("responseCode", "RESULT_OK");
	                if (Consts.DEBUG) {
	                    Log.i(TAG, "purchase was successfully sent to server");
	                }
	                logProductActivity(request.mProductId, "sending purchase request");
	            } else if (responseCode == ResponseCode.RESULT_USER_CANCELED) {
	                oResult.put("responseCode", "RESULT_USER_CANCELED");
	                if (Consts.DEBUG) {
	                    Log.i(TAG, "user canceled purchase");
	                }
	                logProductActivity(request.mProductId, "dismissed purchase dialog");
	            } else {
	                oResult.put("responseCode", "RESULT_FAILED");
	                if (Consts.DEBUG) {
	                    Log.i(TAG, "purchase failed");
	                }
	                logProductActivity(request.mProductId, "request purchase returned " + responseCode);
	            }
	            // TODO: Send back the vent to javascript
	            oResult.put("productId", request.mProductId);
	            if (_pluginReference != null) {
	                PluginResult result = new PluginResult(PluginResult.Status.OK, oResult.toString());
	                result.setKeepCallback(true);
	                _pluginReference.success(result, _pluginReference.getCallbackId());    	
	            }
        	} catch (Exception e) {
				// TODO: handle exception
        		Log.d(TAG, "!!!! exception !!!!");
			}
        }

        @Override
        public void onRestoreTransactionsResponse(RestoreTransactions request, ResponseCode responseCode) {
        	//fireJavaScriptEvent("onRestoreTransactionsResponse", "");
        	
            if (responseCode == ResponseCode.RESULT_OK) {
                if (Consts.DEBUG) {
                    Log.d(TAG, "completed RestoreTransactions request");
                }
                // Update the shared preferences so that we don't perform
                // a RestoreTransactions again.
                SharedPreferences prefs = getPreferences(Context.MODE_PRIVATE);
                SharedPreferences.Editor edit = prefs.edit();
                //edit.putBoolean(DB_INITIALIZED, true);
                edit.commit();
            } else {
                if (Consts.DEBUG) {
                    Log.d(TAG, "RestoreTransactions error: " + responseCode);
                }
            }
        }
    }
    
	@Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    
        
        eInstance = this;
        
        mHandler = new Handler();
        mCallbackPurchaseObserver = new CallbackPurchaseObserver(mHandler);
        mBillingService = new BillingService();
        mBillingService.setContext(this);

        // Check if billing is supported.
        ResponseHandler.register(mCallbackPurchaseObserver);
        if (!mBillingService.checkBillingSupported()) {
            showDialog(DIALOG_CANNOT_CONNECT_ID);
        }
        
        
        super.loadUrl("file:///android_asset/www/index.html");
    }
	
	/**
     * Called when this activity becomes visible.
     */
    @Override
    protected void onStart() {
        super.onStart();
        ResponseHandler.register(mCallbackPurchaseObserver);
    }

    /**
     * Called when this activity is no longer visible.
     */
    @Override
    protected void onStop() {
        super.onStop();
        ResponseHandler.unregister(mCallbackPurchaseObserver);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        mBillingService.unbind();
    }

    private void logProductActivity(String product, String activity) {
        SpannableStringBuilder contents = new SpannableStringBuilder();
        contents.append(Html.fromHtml("<b>" + product + "</b>: "));
        contents.append(activity);
    }
    
    public void startRequestingPurchase(String productId, CallbackBillingPlugin plugin) {
    	_pluginReference = plugin;
    	
    	mSku = productId;
	    if (!mBillingService.requestPurchase(mSku, mPayloadContents)) {
	    	showDialog(DIALOG_BILLING_NOT_SUPPORTED_ID);
	    }
    }
}
