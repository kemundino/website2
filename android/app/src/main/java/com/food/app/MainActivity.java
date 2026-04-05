package com.food.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setUseWideViewPort(true);
            settings.setLoadWithOverviewMode(true);
            
            // This script injects CSS and JS to force the sign-in button out of hidden menus
            webView.setWebViewClient(new WebViewClient() {
                @Override
                public void onPageFinished(WebView view, String url) {
                    super.onPageFinished(view, url);
                    
                    String script = 
                        "(function() { " +
                        "  var style = document.createElement('style');" +
                        "  style.innerHTML = '" +
                        "    /* Force Navbar & Header visibility */ " +
                        "    nav, .navbar, header, [class*=\"nav\"], [id*=\"nav\"] { " +
                        "      display: flex !important; " +
                        "      visibility: visible !important; " +
                        "      opacity: 1 !important; " +
                        "      position: relative !important; " +
                        "      width: 100% !important; " +
                        "    } " +
                        "    /* Force Sign-In/Login elements to show on mobile */ " +
                        "    [class*=\"signin\"], [class*=\"login\"], [id*=\"signin\"], [id*=\"login\"], a[href*=\"login\"], a[href*=\"signin\"] { " +
                        "      display: inline-block !important; " +
                        "      visibility: visible !important; " +
                        "      opacity: 1 !important; " +
                        "      z-index: 9999 !important; " +
                        "      order: -1 !important; /* Move it to the front */ " +
                        "      margin: 5px !important; " +
                        "      font-size: 14px !important; " +
                        "    } " +
                        "    /* Hide the mobile menu button if it's blocking things */ " +
                        "    [class*=\"toggle\"], [class*=\"burger\"], [class*=\"hamburger\"] { " +
                        "      /* display: none !important; */ /* Uncomment if needed */ " +
                        "    } " +
                        "  ';" +
                        "  document.head.appendChild(style);" +
                        "  " +
                        "  /* Ensure the viewport is not zoomed out */ " +
                        "  var meta = document.querySelector(\"meta[name='viewport']\");" +
                        "  if (!meta) {" +
                        "    meta = document.createElement('meta');" +
                        "    meta.name = 'viewport';" +
                        "    document.head.appendChild(meta);" +
                        "  }" +
                        "  meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';" +
                        "})();";
                        
                    view.evaluateJavascript(script, null);
                }
            });
        }
    }
}
