package com.tq.tencent.android.sdk.view;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.KeyEvent;
import android.webkit.DownloadListener;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout.LayoutParams;

public class WebBaseActivity extends Activity
{
  private final DownloadListener downloadlistener = new DownloadListener()
  {
    public void onDownloadStart(String paramAnonymousString1, String paramAnonymousString2, String paramAnonymousString3, String paramAnonymousString4, long paramAnonymousLong)
    {
      Intent localIntent = new Intent("android.intent.action.VIEW", Uri.parse(paramAnonymousString1));
      WebBaseActivity.this.startActivity(localIntent);
    }
  };
  private WebView webView;
  private final WebViewClient webviewClient = new WebViewClient()
  {
    public boolean shouldOverrideUrlLoading(WebView paramAnonymousWebView, String paramAnonymousString)
    {
      paramAnonymousWebView.loadUrl(paramAnonymousString);
      return true;
    }
  };

  protected void onCreate(Bundle paramBundle)
  {
    super.onCreate(paramBundle);
    this.webView = new WebView(this);
    this.webView.setLayoutParams(new LinearLayout.LayoutParams(-1, -1));
    this.webView.setWebViewClient(this.webviewClient);
    this.webView.setDownloadListener(this.downloadlistener);
    this.webView.requestFocus();
    this.webView.requestFocusFromTouch();
    System.gc();
    WebSettings localWebSettings = this.webView.getSettings();
    localWebSettings.setPluginsEnabled(true);
    localWebSettings.setAllowFileAccess(true);
    localWebSettings.setJavaScriptEnabled(true);
    localWebSettings.setJavaScriptCanOpenWindowsAutomatically(true);
    localWebSettings.setLoadsImagesAutomatically(true);
    localWebSettings.setUseWideViewPort(false);
    localWebSettings.setSupportZoom(true);
    localWebSettings.supportMultipleWindows();
    localWebSettings.setNeedInitialFocus(true);
    setContentView(this.webView);
    Intent localIntent = getIntent();
    if (localIntent != null)
    {
      String str = localIntent.getStringExtra("url");
      if (!TextUtils.isEmpty("url"))
        this.webView.loadUrl(str);
    }
  }

  public boolean onKeyDown(int paramInt, KeyEvent paramKeyEvent)
  {
    if ((paramInt == 4) && (this.webView.canGoBack()))
    {
      this.webView.goBack();
      return true;
    }
    return super.onKeyDown(paramInt, paramKeyEvent);
  }

  protected void onPause()
  {
    super.onPause();
  }

  protected void onResume()
  {
    super.onResume();
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.view.WebBaseActivity
 * JD-Core Version:    0.6.2
 */