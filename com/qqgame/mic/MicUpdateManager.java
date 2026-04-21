package com.qqgame.mic;

import android.annotation.SuppressLint;
import android.app.AlertDialog.Builder;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.content.DialogInterface.OnKeyListener;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Environment;
import android.os.Handler;
import android.os.Message;
import android.util.Log;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

public class MicUpdateManager
{
  private static final int DOWN_ERROR_NETWORKING = 3;
  private static final int DOWN_ERROR_NOSPACE = 4;
  private static final int DOWN_ERROR_SDCARD_NOT_WRITEABLE = 5;
  private static final int DOWN_OVER = 2;
  private static final int DOWN_UPDATE = 1;
  private static String saveFileName = "";
  private static String savePath = "";
  static final String tag = "hlddzDown";
  String apkName = "QQgame_hlddz.apk";
  final String apkNameDefault = "QQgame_hlddz.apk";
  private String apkUrl = null;
  String diffApk;
  private Thread downLoadThread = null;
  private Dialog downloadDialog = null;
  long dowsize = 0L;
  final String hlddzPackage = "com.qqgame.hlddz";
  private boolean interceptFlag = false;
  private Context mContext;
  private Handler mHandler = new Handler()
  {
    public void handleMessage(Message paramAnonymousMessage)
    {
      switch (paramAnonymousMessage.what)
      {
      default:
      case 1:
      case 2:
        do
        {
          do
          {
            do
              return;
            while (MicUpdateManager.this.downloadDialog == null);
            MicUpdateManager.this.mProgress.setProgress(MicUpdateManager.this.progress);
          }
          while (MicUpdateManager.this.totalsize <= 0L);
          MicUpdateManager.this.mTextView.setText("已下载: " + MicUpdateManager.this.dowsize + "/" + MicUpdateManager.this.totalsize);
          return;
          if (!"QQgame_hlddz.apk".endsWith(MicUpdateManager.this.apkName))
            break;
          Log.i("hlddzDown", "full package");
        }
        while (MicUpdateManager.this.install(MicUpdateManager.saveFileName));
        MicUpdateManager.this.showNoticeDialog("软件版本更新", "重试", "取消", "安装失败，是否重新下载？");
        return;
        Log.i("hlddzDown", "diff package");
        MicUpdateManager.this.startRestore();
        return;
      case 3:
        if (MicUpdateManager.this.downloadDialog != null)
        {
          MicUpdateManager.this.downloadDialog.dismiss();
          MicUpdateManager.access$002(MicUpdateManager.this, null);
        }
        MicUpdateManager.this.showNoticeDialog("软件版本更新", "重试", "取消", "下载失败，请检查网络后重试");
        return;
      case 4:
        if (MicUpdateManager.this.downloadDialog != null)
        {
          MicUpdateManager.this.downloadDialog.dismiss();
          MicUpdateManager.access$002(MicUpdateManager.this, null);
        }
        MicUpdateManager.this.showNoticeDialog("软件版本更新", "重试", "取消", "存储空间不足，请释放空间后重试");
        return;
      case 5:
      }
      Log.i("hlddzDown", "DOWN_ERROR_SDCARD_NOT_WRITEABLE");
      if (MicUpdateManager.this.downloadDialog != null)
      {
        MicUpdateManager.this.downloadDialog.dismiss();
        MicUpdateManager.access$002(MicUpdateManager.this, null);
      }
      MicUpdateManager.this.showMyNoticeDialog("提示", "确定", "取消", "下载失败，sd卡当前不存在或不可写。");
    }
  };
  private ProgressBar mProgress;
  private TextView mTextView;
  private Runnable mdownApkRunnable = new Runnable()
  {
    public void run()
    {
      try
      {
        HttpURLConnection localHttpURLConnection = (HttpURLConnection)new URL(MicUpdateManager.this.apkUrl).openConnection();
        localHttpURLConnection.connect();
        MicUpdateManager.this.totalsize = localHttpURLConnection.getContentLength();
        InputStream localInputStream = localHttpURLConnection.getInputStream();
        File localFile = new File(MicUpdateManager.savePath);
        if (!localFile.exists())
          localFile.mkdir();
        Log.i("hlddzDown", "can write sdcard ");
        MicUpdateManager.access$1102(hlddzDownloader.getSDPath() + "/updatehlddz/");
        MicUpdateManager.access$402(MicUpdateManager.savePath + MicUpdateManager.this.apkName);
        FileOutputStream localFileOutputStream = new FileOutputStream(new File(MicUpdateManager.saveFileName));
        byte[] arrayOfByte = new byte[1024];
        int i = localInputStream.read(arrayOfByte);
        MicUpdateManager localMicUpdateManager = MicUpdateManager.this;
        localMicUpdateManager.dowsize += i;
        MicUpdateManager.access$102(MicUpdateManager.this, (int)(100.0F * ((float)MicUpdateManager.this.dowsize / (float)MicUpdateManager.this.totalsize)));
        MicUpdateManager.this.mHandler.sendEmptyMessage(1);
        if (i <= 0)
        {
          MicUpdateManager.access$102(MicUpdateManager.this, 100);
          MicUpdateManager.this.mHandler.sendEmptyMessage(2);
        }
        while (true)
        {
          localFileOutputStream.close();
          localInputStream.close();
          localHttpURLConnection.disconnect();
          return;
          localFileOutputStream.write(arrayOfByte, 0, i);
          boolean bool = MicUpdateManager.this.interceptFlag;
          if (!bool)
            break;
        }
      }
      catch (MalformedURLException localMalformedURLException)
      {
        localMalformedURLException.printStackTrace();
        return;
      }
      catch (IOException localIOException)
      {
        localIOException.getMessage();
        if (!localIOException.getMessage().contentEquals("No space left on device"))
          break label345;
      }
      MicUpdateManager.this.mHandler.sendEmptyMessage(4);
      while (true)
      {
        localIOException.printStackTrace();
        return;
        label345: MicUpdateManager.this.mHandler.sendEmptyMessage(3);
      }
    }
  };
  String newApk = this.newApkPath + "QQgame_hlddz.apk";
  String newApkPath = "/sdcard/Tencent/QQGame/hlddz/";
  private Dialog noticeDialog;
  String oldApk;
  private int progress;
  long totalsize = 0L;

  public MicUpdateManager(Context paramContext, String paramString)
  {
    this.mContext = paramContext;
    this.apkUrl = paramString;
    int i = this.apkUrl.lastIndexOf("/");
    this.apkName = this.apkUrl.substring(i + 1);
    if (!"QQgame_hlddz.apk".equals(this.apkName))
    {
      this.apkName = (MicActivity.getChannel() + "_" + this.apkName);
      String str = this.apkUrl.substring(0, i + 1);
      this.apkUrl = (str + this.apkName);
    }
  }

  private void downloadApk()
  {
    this.downLoadThread = new Thread(this.mdownApkRunnable);
    this.downLoadThread.start();
  }

  private boolean install(String paramString)
  {
    File localFile = new File(paramString);
    if (!localFile.exists())
      return false;
    Intent localIntent = new Intent("android.intent.action.VIEW");
    localIntent.setDataAndType(Uri.parse("file://" + localFile.toString()), "application/vnd.android.package-archive");
    this.mContext.startActivity(localIntent);
    return true;
  }

  private void showDownloadDialog()
  {
    AlertDialog.Builder localBuilder = new AlertDialog.Builder(this.mContext);
    localBuilder.setTitle("软件版本更新");
    View localView = LayoutInflater.from(this.mContext).inflate(2130903042, null);
    this.mProgress = ((ProgressBar)localView.findViewById(2131034117));
    this.mTextView = ((TextView)localView.findViewById(2131034118));
    localBuilder.setView(localView);
    localBuilder.setNegativeButton("取消", new DialogInterface.OnClickListener()
    {
      public void onClick(DialogInterface paramAnonymousDialogInterface, int paramAnonymousInt)
      {
        paramAnonymousDialogInterface.dismiss();
        MicUpdateManager.access$902(MicUpdateManager.this, true);
      }
    });
    this.downloadDialog = localBuilder.create();
    this.downloadDialog.setCancelable(false);
    this.downloadDialog.setOnKeyListener(new DialogInterface.OnKeyListener()
    {
      public boolean onKey(DialogInterface paramAnonymousDialogInterface, int paramAnonymousInt, KeyEvent paramAnonymousKeyEvent)
      {
        return paramAnonymousInt == 84;
      }
    });
    this.downloadDialog.show();
    downloadApk();
  }

  private void showMyNoticeDialog(String paramString1, String paramString2, String paramString3, String paramString4)
  {
    AlertDialog.Builder localBuilder = new AlertDialog.Builder(this.mContext);
    localBuilder.setTitle(paramString1);
    localBuilder.setMessage(paramString4);
    localBuilder.setPositiveButton(paramString2, new DialogInterface.OnClickListener()
    {
      public void onClick(DialogInterface paramAnonymousDialogInterface, int paramAnonymousInt)
      {
        paramAnonymousDialogInterface.dismiss();
      }
    });
    localBuilder.setNegativeButton(paramString3, new DialogInterface.OnClickListener()
    {
      public void onClick(DialogInterface paramAnonymousDialogInterface, int paramAnonymousInt)
      {
        paramAnonymousDialogInterface.dismiss();
      }
    });
    localBuilder.create().show();
  }

  private void showNoticeDialog(String paramString1, String paramString2, String paramString3, String paramString4)
  {
    AlertDialog.Builder localBuilder = new AlertDialog.Builder(this.mContext);
    localBuilder.setTitle(paramString1);
    localBuilder.setMessage(paramString4);
    localBuilder.setPositiveButton(paramString2, new DialogInterface.OnClickListener()
    {
      public void onClick(DialogInterface paramAnonymousDialogInterface, int paramAnonymousInt)
      {
        paramAnonymousDialogInterface.dismiss();
        MicUpdateManager.this.showDownloadDialog();
      }
    });
    localBuilder.setNegativeButton(paramString3, new DialogInterface.OnClickListener()
    {
      public void onClick(DialogInterface paramAnonymousDialogInterface, int paramAnonymousInt)
      {
        paramAnonymousDialogInterface.dismiss();
      }
    });
    this.noticeDialog = localBuilder.create();
    this.noticeDialog.show();
  }

  public void CancelDownload()
  {
    if (this.downLoadThread != null)
      this.downLoadThread.suspend();
  }

  public void ShowUpdateInfo()
  {
    this.interceptFlag = false;
    if (Environment.getExternalStorageState().equals("mounted"))
    {
      showDownloadDialog();
      return;
    }
    showMyNoticeDialog("提示", "确定", "取消", "下载失败，sd卡当前不存在或不可写。");
  }

  @SuppressLint({"ParserError", "ParserError"})
  String getApkPath(String paramString)
  {
    String str1 = "";
    List localList = this.mContext.getPackageManager().getInstalledPackages(0);
    if (localList != null);
    for (int i = 0; ; i++)
      if (i < localList.size())
      {
        PackageInfo localPackageInfo = (PackageInfo)localList.get(i);
        String str2 = localPackageInfo.packageName;
        if ((str2 != null) && (str2.equals(paramString)))
        {
          Log.i("hlddzDown", "Package[" + paramString + "]:is installed.");
          str1 = localPackageInfo.applicationInfo.sourceDir;
        }
      }
      else
      {
        Log.i("hlddzDown", "path:" + str1);
        return str1;
      }
  }

  public void onResume()
  {
    if ((this.downLoadThread != null) && (!this.downLoadThread.isAlive()))
      this.downLoadThread.resume();
  }

  void startRestore()
  {
    Log.i("hlddzDown", "startRestore");
    this.oldApk = getApkPath("com.qqgame.hlddz");
    File localFile1 = new File(this.oldApk);
    this.diffApk = saveFileName;
    File localFile2 = new File(this.diffApk);
    if (!localFile1.exists())
      Log.i("hlddzDown", "oldApk:" + this.oldApk + localFile1.exists());
    do
    {
      return;
      if (!localFile2.exists())
      {
        Log.i("hlddzDown", "diffApk:" + this.diffApk + localFile2.exists());
        return;
      }
      this.newApkPath = (hlddzDownloader.getSDPath() + "/Tencent/QQGame/hlddz/");
      File localFile3 = new File(this.newApkPath);
      if (!localFile3.exists())
      {
        Log.i("hlddzDown", "newApkPath" + this.newApkPath + "newapkfile.mkdirs");
        localFile3.mkdirs();
      }
      this.newApk = (this.newApkPath + "QQgame_hlddz.apk");
      Log.i("hlddzDown", "restoreApk  oldApk:" + this.oldApk + " newApk:" + this.newApk + " diffApk:" + this.diffApk);
      Log.i("hlddzDown", "restoreApk");
    }
    while (!hlddzDownloader.restoreApk(this.oldApk, this.newApk, this.diffApk));
    if (this.downloadDialog != null)
    {
      this.downloadDialog.dismiss();
      this.downloadDialog = null;
    }
    install(this.newApk);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.qqgame.mic.MicUpdateManager
 * JD-Core Version:    0.6.2
 */