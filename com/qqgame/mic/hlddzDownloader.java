package com.qqgame.mic;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.app.AlertDialog.Builder;
import android.app.Dialog;
import android.app.DownloadManager;
import android.app.DownloadManager.Query;
import android.app.DownloadManager.Request;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.content.DialogInterface.OnKeyListener;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Environment;
import android.os.Handler;
import android.os.Message;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import java.io.File;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

@SuppressLint({"NewApi", "NewApi", "NewApi", "ParserError"})
public class hlddzDownloader
{
  private static final String DL_ID = "downloadId";
  private static final Exception IOException = null;
  public static final int MSG_DWFAIL = 3;
  public static final int MSG_DWPACKSIZE = 1;
  public static final int MSG_PACKAGE_ADDED = 5;
  public static final int MSG_PROGRESS = 2;
  public static final int MSG_UPDATE = 4;
  static final String tag = "hlddzDownload";
  private String InstallApkPath;
  String absoluteDownloadPath;
  String apkName = "QQgame_hlddz.apk";
  final String apkNameDefault = "QQgame_hlddz.apk";
  Cursor cursor;
  String diffApk;
  private AlertDialog downloadDialog;
  Thread downloadThread = null;
  boolean downok = true;
  long dowsize = 0L;
  Handler handler = new Handler()
  {
    public void handleMessage(Message paramAnonymousMessage)
    {
      switch (paramAnonymousMessage.what)
      {
      case 5:
      default:
      case 1:
      case 2:
        int j;
        do
        {
          return;
          String str = String.valueOf(paramAnonymousMessage.arg1);
          Log.i("hlddzDownload", "dwpacksize=" + str);
          return;
          j = paramAnonymousMessage.arg1;
          Log.i("hlddzDownload", "progress=" + j);
          if (hlddzDownloader.this.downloadDialog != null)
          {
            hlddzDownloader.this.mProgress.setProgress(j);
            Log.i("hlddzDownload", "dowsize=" + hlddzDownloader.this.dowsize + " totalsize:" + hlddzDownloader.this.totalsize);
            if (hlddzDownloader.this.totalsize > 0L)
              hlddzDownloader.this.mTextView.setText("已下载: " + hlddzDownloader.this.dowsize + "/" + hlddzDownloader.this.totalsize);
          }
          hlddzDownloader.access$302(hlddzDownloader.this, j);
        }
        while (j != 100);
        hlddzDownloader.this.downloadComplete();
        return;
      case 3:
        hlddzDownloader.this.stopDownload();
        int i = paramAnonymousMessage.arg1;
        hlddzDownloader.this.showRetryDownloadDialog("提示", "重试", "取消", hlddzDownloader.this.failMessage(i));
        return;
      case 4:
      }
      hlddzDownloader.this.updateProgress();
    }
  };
  final String hlddzPackage = "com.qqgame.hlddz";
  private String httpDownloadUrl = "http://113.108.11.249:8989/minigamefile/terminal/andriod/QQgame_hlddz.apk";
  private boolean interceptFlag = false;
  boolean isDelDownloadApk = false;
  boolean isDelDownloadTask = false;
  long lastDownload = -1L;
  private Context mContext;
  private ProgressBar mProgress;
  private TextView mTextView;
  DownloadManager manager;
  String newApk = this.newApkPath + "QQgame_hlddz.apk";
  String newApkPath = "/sdcard/Tencent/QQGame/hlddz/";
  String oldApk;
  BroadcastReceiver onComplete = new BroadcastReceiver()
  {
    public void onReceive(Context paramAnonymousContext, Intent paramAnonymousIntent)
    {
      if (paramAnonymousIntent.getAction().equals("android.intent.action.DOWNLOAD_COMPLETE"))
      {
        long l = paramAnonymousIntent.getLongExtra("extra_download_id", -1L);
        Log.v("hlddzDownload", " download complete! id : " + l);
        Log.v("hlddzDownload", "lastDownload: " + hlddzDownloader.this.lastDownload);
        if (hlddzDownloader.this.mContext.getPackageName().equals(paramAnonymousContext.getPackageName()))
        {
          Message localMessage = new Message();
          localMessage.what = 2;
          localMessage.arg1 = 100;
          hlddzDownloader.this.handler.sendMessage(localMessage);
          Log.i("hlddzDownload", "sendMessage:MSG_PROGRESS");
        }
        if (hlddzDownloader.this.lastDownload != l);
      }
    }
  };
  BroadcastReceiver onNotification = new BroadcastReceiver()
  {
    public void onReceive(Context paramAnonymousContext, Intent paramAnonymousIntent)
    {
      Log.v("hlddzDownload", " onNotification ");
      if (paramAnonymousIntent.getAction().equals("android.intent.action.DOWNLOAD_NOTIFICATION_CLICKED"))
      {
        long l = paramAnonymousIntent.getLongExtra("extra_download_id", 0L);
        Log.v("hlddzDownload", " ACTION_NOTIFICATION_CLICKED id : " + l);
        Log.v("hlddzDownload", " context.getPackageName() : " + paramAnonymousContext.getPackageName());
        if (hlddzDownloader.this.mContext.getPackageName().equals(paramAnonymousContext.getPackageName()))
          hlddzDownloader.this.notifyCationClicked(l);
      }
    }
  };
  private SharedPreferences prefs;
  private int progress = 0;
  DownloadManager.Query query = new DownloadManager.Query();
  State state = State.Resume;
  long totalsize = 0L;
  boolean updateTotalSize = false;

  public hlddzDownloader(Context paramContext, String paramString)
  {
    this.mContext = paramContext;
    this.httpDownloadUrl = paramString;
    int i = this.httpDownloadUrl.lastIndexOf("/");
    this.apkName = this.httpDownloadUrl.substring(i + 1);
    if (!"QQgame_hlddz.apk".equals(this.apkName))
    {
      this.apkName = (MicActivity.getChannel() + "_" + this.apkName);
      String str = this.httpDownloadUrl.substring(0, i + 1);
      this.httpDownloadUrl = (str + this.apkName);
    }
    Log.i("hlddzDownload", "httpDownloadUrl:" + this.httpDownloadUrl);
    Context localContext = this.mContext;
    this.manager = ((DownloadManager)localContext.getSystemService("download"));
    this.prefs = PreferenceManager.getDefaultSharedPreferences(this.mContext);
    this.mContext.registerReceiver(this.onComplete, new IntentFilter("android.intent.action.DOWNLOAD_COMPLETE"));
    this.mContext.registerReceiver(this.onNotification, new IntentFilter("android.intent.action.DOWNLOAD_NOTIFICATION_CLICKED"));
    Log.i("hlddzDownload", "apkName:" + this.apkName);
    startDownload();
  }

  private void closeDownloadDig()
  {
    Log.i("hlddzDownload", "closeDownloadDig");
    if (this.downloadDialog != null)
    {
      this.downloadDialog.hide();
      this.downloadDialog.dismiss();
      this.downloadDialog = null;
    }
  }

  public static void delDownloadApk(String paramString)
  {
    Log.v("hlddzDownload", "delDownloadApk:" + paramString);
    File localFile = new File(paramString);
    if (!localFile.exists())
    {
      Log.v("hlddzDownload", " apkfile is not exists");
      return;
    }
    Log.v("hlddzDownload", " apkfile  delete");
    localFile.delete();
  }

  private int downloadStatus(Cursor paramCursor)
  {
    int i = paramCursor.getInt(paramCursor.getColumnIndex("status"));
    switch (i)
    {
    default:
      Log.i("hlddzDownload", "Download STATUS_FAILED");
      return i;
    case 16:
      Log.i("hlddzDownload", "Download STATUS_FAILED");
      return i;
    case 4:
      Log.i("hlddzDownload", "Download STATUS_PAUSED");
      return i;
    case 1:
      Log.i("hlddzDownload", "Download STATUS_PENDING");
      return i;
    case 2:
      Log.i("hlddzDownload", "Download STATUS_RUNNING");
      return i;
    case 8:
    }
    Log.i("hlddzDownload", "Download STATUS_SUCCESSFUL");
    return i;
  }

  public static String getSDPath()
  {
    Log.i("hlddzDownload", "getSDPath :");
    if (Environment.getExternalStorageState().equals("mounted"))
    {
      File localFile = Environment.getExternalStorageDirectory();
      Log.i("hlddzDownload", "sdDir :" + localFile.toString());
      return localFile.toString();
    }
    return "";
  }

  private void queryDownloadStatus()
  {
    Log.i("hlddzDownload", "queryDownloadStatus: downok " + this.downok);
    if (!this.downok)
      return;
    long l = this.prefs.getLong("downloadId", 0L);
    Log.i("hlddzDownload", "index:" + l);
    this.query.setFilterById(new long[] { l });
    this.downloadThread = new Thread(new Runnable()
    {
      public void run()
      {
        Log.i("hlddzDownload", "run");
        hlddzDownloader.this.downok = false;
        hlddzDownloader.access$302(hlddzDownloader.this, 0);
        while (true)
          if (!hlddzDownloader.this.downok)
          {
            if ((hlddzDownloader.this.updateTotalSize) && (hlddzDownloader.this.totalsize <= 0L));
            try
            {
              HttpURLConnection localHttpURLConnection = (HttpURLConnection)new URL(hlddzDownloader.this.httpDownloadUrl).openConnection();
              localHttpURLConnection.connect();
              hlddzDownloader.this.totalsize = localHttpURLConnection.getContentLength();
              Log.i("hlddzDownload", "conn.getContentLength():" + hlddzDownloader.this.totalsize);
              localHttpURLConnection.disconnect();
              if (hlddzDownloader.this.totalsize > 0L)
                hlddzDownloader.this.updateTotalSize = false;
              Message localMessage = new Message();
              localMessage.what = 4;
              hlddzDownloader.this.handler.sendMessage(localMessage);
              Log.i("hlddzDownload", "sendMessage:MSG_UPDATE");
              try
              {
                Thread.sleep(1000L);
              }
              catch (InterruptedException localInterruptedException)
              {
                localInterruptedException.printStackTrace();
              }
            }
            catch (MalformedURLException localMalformedURLException)
            {
              while (true)
                localMalformedURLException.printStackTrace();
            }
            catch (IOException localIOException)
            {
              while (true)
              {
                localIOException.getMessage();
                localIOException.printStackTrace();
              }
            }
          }
      }
    });
    this.downloadThread.start();
  }

  public static native boolean restoreApk(String paramString1, String paramString2, String paramString3);

  private void showDownloadDialog()
  {
    AlertDialog.Builder localBuilder = new AlertDialog.Builder(this.mContext);
    localBuilder.setTitle("下载进度");
    View localView = LayoutInflater.from(this.mContext).inflate(2130903042, null);
    this.mProgress = ((ProgressBar)localView.findViewById(2131034117));
    this.mTextView = ((TextView)localView.findViewById(2131034118));
    this.mTextView.setText("");
    localBuilder.setView(localView);
    localBuilder.setNegativeButton("取消", new DialogInterface.OnClickListener()
    {
      public void onClick(DialogInterface paramAnonymousDialogInterface, int paramAnonymousInt)
      {
        hlddzDownloader.this.stopDownload();
        hlddzDownloader.this.clearDownload();
        hlddzDownloader.delDownloadApk(hlddzDownloader.this.absoluteDownloadPath);
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
  }

  private void showRetryDownloadDialog(String paramString1, String paramString2, String paramString3, String paramString4)
  {
    AlertDialog.Builder localBuilder = new AlertDialog.Builder(this.mContext);
    localBuilder.setTitle(paramString1);
    localBuilder.setMessage(paramString4);
    localBuilder.setPositiveButton(paramString2, new DialogInterface.OnClickListener()
    {
      public void onClick(DialogInterface paramAnonymousDialogInterface, int paramAnonymousInt)
      {
        paramAnonymousDialogInterface.dismiss();
        hlddzDownloader.this.closeDownloadDig();
        hlddzDownloader.this.download();
      }
    });
    localBuilder.setNegativeButton(paramString3, new DialogInterface.OnClickListener()
    {
      public void onClick(DialogInterface paramAnonymousDialogInterface, int paramAnonymousInt)
      {
        paramAnonymousDialogInterface.dismiss();
        hlddzDownloader.this.closeDownloadDig();
      }
    });
    localBuilder.create().show();
  }

  void clearDownload()
  {
    Log.i("hlddzDownload", "clearDownload");
    this.prefs.edit().clear();
    this.prefs.edit().putLong("downloadId", -1L).commit();
    if (this.lastDownload >= 0L)
    {
      DownloadManager localDownloadManager = this.manager;
      long[] arrayOfLong = new long[1];
      arrayOfLong[0] = this.lastDownload;
      localDownloadManager.remove(arrayOfLong);
    }
  }

  public void delDownloads()
  {
    for (int i = 0; i <= this.lastDownload; i++)
    {
      DownloadManager localDownloadManager = this.manager;
      long[] arrayOfLong = new long[1];
      arrayOfLong[0] = i;
      localDownloadManager.remove(arrayOfLong);
    }
  }

  void download()
  {
    Log.v("hlddzDownload", "download");
    if (Environment.getExternalStorageState().equals("mounted"))
    {
      getDownloadPath();
      if (this.isDelDownloadTask)
        for (int i = 0; i < this.lastDownload; i++)
        {
          DownloadManager localDownloadManager = this.manager;
          long[] arrayOfLong = new long[1];
          arrayOfLong[0] = i;
          localDownloadManager.remove(arrayOfLong);
        }
      Log.v("hlddzDownload", Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).getAbsolutePath());
      Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).mkdirs();
      DownloadManager.Request localRequest = new DownloadManager.Request(Uri.parse(this.httpDownloadUrl));
      localRequest.setTitle("下载");
      localRequest.setDescription(this.apkName);
      Log.i("hlddzDownload", "setShowRunningNotification");
      localRequest.setShowRunningNotification(true);
      localRequest.setAllowedNetworkTypes(3);
      Log.i("hlddzDownload", "setVisibleInDownloadsUi");
      localRequest.setVisibleInDownloadsUi(true);
      Log.i("hlddzDownload", "setDestinationInExternalFilesDir");
      localRequest.setDestinationInExternalFilesDir(this.mContext, null, this.apkName);
      localRequest.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, this.apkName);
      Log.i("hlddzDownload", "manager.enqueue");
      this.lastDownload = this.manager.enqueue(localRequest);
      this.prefs.edit().clear();
      this.prefs.edit().putLong("downloadId", this.lastDownload).commit();
      Log.i("hlddzDownload", "lastDownload:" + this.lastDownload);
      this.dowsize = 0L;
      this.totalsize = 0L;
      showDownloadDialog();
      queryDownloadStatus();
      return;
    }
    Log.i("hlddzDownload", "showRetryDownloadDialog");
    showRetryDownloadDialog("提示", "重试", "取消", "下载失败，sd卡当前不存在或不可写。");
  }

  public void downloadComplete()
  {
    Log.i("hlddzDownload", "downloadComplete");
    if (!this.downok)
    {
      getDownloadPath();
      if (!"QQgame_hlddz.apk".equals(this.apkName))
        break label123;
      stopDownload();
      Log.i("hlddzDownload", "full package");
      this.InstallApkPath = this.absoluteDownloadPath;
      if (!install(this.absoluteDownloadPath))
        showRetryDownloadDialog("提示", "重试", "取消", "安装文件不存在，重新下载？");
    }
    else
    {
      return;
    }
    this.prefs.edit().clear();
    this.prefs.edit().putLong("downloadId", -1L).commit();
    return;
    label123: Log.i("hlddzDownload", "diff package");
    this.downok = true;
    startRestore();
  }

  String failMessage(int paramInt)
  {
    switch (paramInt)
    {
    case 1003:
    default:
      return "下载失败，未知错误";
    case 1008:
      return "下载失败，无法重新开始任务";
    case 1007:
      return "下载失败，设备没找到";
    case 1009:
      return "文件已存在";
    case 1001:
      return "下载失败，文件错误";
    case 1004:
      return "下载失败，http数据错误";
    case 1006:
      return "下载失败，空间不足";
    case 1005:
      return "下载失败，重定向太多";
    case 1002:
      return "下载失败，未处理http";
    case 1000:
    }
    return "下载失败，未知错误";
  }

  protected void finalize()
    throws Throwable
  {
    if (this.onComplete != null)
      this.mContext.unregisterReceiver(this.onComplete);
    if (this.onNotification != null)
      this.mContext.unregisterReceiver(this.onNotification);
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
          Log.i("hlddzDownload", "Package[" + paramString + "]:is installed.");
          str1 = localPackageInfo.applicationInfo.sourceDir;
        }
      }
      else
      {
        Log.i("hlddzDownload", "path:" + str1);
        return str1;
      }
  }

  String getDownloadPath()
  {
    this.absoluteDownloadPath = (Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).getAbsolutePath() + "/" + this.apkName);
    Log.v("hlddzDownload", "absoluteDownloadPath:" + this.absoluteDownloadPath);
    return this.absoluteDownloadPath;
  }

  public boolean install(String paramString)
  {
    File localFile = new File(paramString);
    if (!localFile.exists())
    {
      Log.v("hlddzDownload", " apkfile is not exists");
      return false;
    }
    Log.v("hlddzDownload", " install :" + paramString);
    Log.i("hlddzDownload", "state:" + this.state);
    if (this.state == State.Pause)
    {
      this.state = State.Install;
      return true;
    }
    Intent localIntent = new Intent("android.intent.action.VIEW");
    localIntent.setDataAndType(Uri.parse("file://" + localFile.toString()), "application/vnd.android.package-archive");
    this.mContext.startActivity(localIntent);
    return true;
  }

  public boolean isDownloadComplete()
  {
    return this.progress == 100;
  }

  void notifyCationClicked(long paramLong)
  {
    Log.v("hlddzDownload", " notifyCationClicked : " + paramLong);
    Intent localIntent = new Intent();
    localIntent.addFlags(131072);
    localIntent.setClass(this.mContext, this.mContext.getClass());
    this.mContext.startActivity(localIntent);
  }

  protected void onDestroy()
  {
    if (this.onComplete != null)
      this.mContext.unregisterReceiver(this.onComplete);
    if (this.onNotification != null)
      this.mContext.unregisterReceiver(this.onNotification);
  }

  public void onPause()
  {
    Log.i("hlddzDownload", "downloader.onPause()");
    this.state = State.Pause;
    Log.i("hlddzDownload", "state:" + this.state);
  }

  public void onResume()
  {
    Log.i("hlddzDownload", "downloader.onResume()");
    Log.i("hlddzDownload", "state:" + this.state);
    if (this.state == State.Install)
      install(this.InstallApkPath);
    this.state = State.Resume;
  }

  public void startDownload()
  {
    Log.v("hlddzDownload", "startDownload");
    if ((!this.prefs.contains("downloadId")) || (this.prefs.getLong("downloadId", -1L) < 0L))
    {
      download();
      return;
    }
    this.lastDownload = this.prefs.getLong("downloadId", 0L);
    Log.v("hlddzDownload", "lastDownload:" + this.lastDownload);
    showDownloadDialog();
    queryDownloadStatus();
  }

  void startRestore()
  {
    Log.i("hlddzDownload", "startRestore");
    this.oldApk = getApkPath("com.qqgame.hlddz");
    File localFile1 = new File(this.oldApk);
    this.diffApk = this.absoluteDownloadPath;
    File localFile2 = new File(this.diffApk);
    if (!localFile1.exists())
      Log.i("hlddzDownload", this.oldApk + localFile1.exists());
    do
    {
      do
      {
        return;
        if (!localFile2.exists())
        {
          Log.i("hlddzDownload", this.diffApk + localFile2.exists());
          showRetryDownloadDialog("提示", "重试", "取消", "安装文件不存在，重新下载？");
          return;
        }
        this.newApkPath = (getSDPath() + "/Tencent/QQGame/hlddz/");
        File localFile3 = new File(this.newApkPath);
        if (!localFile3.exists())
        {
          Log.i("hlddzDownload", "newApkPath" + this.newApkPath + "newapkfile.mkdirs");
          localFile3.mkdirs();
        }
        this.newApk = (this.newApkPath + "QQgame_hlddz.apk");
        Log.i("hlddzDownload", "restoreApk  oldApk:" + this.oldApk + " newApk:" + this.newApk + " diffApk:" + this.diffApk);
        Log.i("hlddzDownload", "restoreApk");
      }
      while (!restoreApk(this.oldApk, this.newApk, this.diffApk));
      closeDownloadDig();
      this.InstallApkPath = this.newApk;
    }
    while (!install(this.newApk));
    this.prefs.edit().clear();
    this.prefs.edit().putLong("downloadId", -1L).commit();
  }

  void stopDownload()
  {
    Log.i("hlddzDownload", "stopDownload");
    this.downok = true;
    closeDownloadDig();
  }

  void updateProgress()
  {
    this.cursor = this.manager.query(this.query);
    if (this.cursor == null)
      Log.i("hlddzDownload", "cursor == null");
    while (true)
    {
      this.cursor.close();
      return;
      while (this.cursor.moveToNext())
      {
        if ((this.totalsize <= 0L) && (!this.updateTotalSize))
        {
          int k = this.cursor.getColumnIndex("total_size");
          Log.i("hlddzDownload", "fileIndex:" + k);
          this.totalsize = this.cursor.getLong(k);
          Log.i("hlddzDownload", "totalsize:" + this.totalsize);
          if (this.totalsize <= 0L)
            this.updateTotalSize = true;
          if (this.totalsize > 0L)
          {
            Message localMessage3 = new Message();
            localMessage3.what = 1;
            localMessage3.arg1 = ((int)this.totalsize);
            this.handler.sendMessage(localMessage3);
            Log.i("hlddzDownload", "sendMessage:MSG_DWPACKSIZE");
          }
        }
        long l = this.cursor.getLong(this.cursor.getColumnIndex("bytes_so_far"));
        Log.i("hlddzDownload", "curdowsize:" + l);
        if (this.totalsize > 0L);
        for (this.progress = ((int)(100L * this.dowsize / this.totalsize)); ; this.progress = (5 + this.progress))
          do
          {
            this.dowsize = l;
            if (downloadStatus(this.cursor) != 16)
              break label425;
            int i = this.cursor.getColumnIndex("reason");
            int j = this.cursor.getInt(i);
            Message localMessage2 = new Message();
            localMessage2.what = 3;
            localMessage2.arg1 = j;
            this.handler.sendMessage(localMessage2);
            Log.i("hlddzDownload", "sendMessage:MSG_DWFAIL");
            break;
          }
          while ((l <= this.dowsize) || (this.dowsize <= 0L) || (this.progress >= 100));
        label425: Message localMessage1 = new Message();
        localMessage1.what = 2;
        localMessage1.arg1 = this.progress;
        this.handler.sendMessage(localMessage1);
        Log.i("hlddzDownload", "sendMessage:MSG_PROGRESS");
      }
    }
  }

  public static enum State
  {
    static
    {
      Pause = new State("Pause", 1);
      Install = new State("Install", 2);
      State[] arrayOfState = new State[3];
      arrayOfState[0] = Resume;
      arrayOfState[1] = Pause;
      arrayOfState[2] = Install;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.qqgame.mic.hlddzDownloader
 * JD-Core Version:    0.6.2
 */