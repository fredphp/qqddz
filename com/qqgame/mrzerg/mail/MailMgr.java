package com.qqgame.mrzerg.mail;

import android.app.ProgressDialog;
import android.os.Handler;
import android.os.Message;
import android.widget.Toast;
import com.qqgame.mic.MicActivity;

public class MailMgr
{
  public static final int MSG_FAIL = 3;
  public static final int MSG_HIDEPROGRESS = 1;
  public static final int MSG_SHOWPROGRESS = 0;
  public static final int MSG_SUCCESS = 2;
  Handler mHandler = new Handler()
  {
    public void handleMessage(Message paramAnonymousMessage)
    {
      switch (paramAnonymousMessage.what)
      {
      default:
        return;
      case 0:
        MailMgr.this.mProgress = new ProgressDialog(MicActivity.s_CurrActivity);
        MailMgr.this.mProgress.setTitle("发送反馈");
        MailMgr.this.mProgress.setMessage("发送中...");
        MailMgr.this.mProgress.setProgressStyle(0);
        MailMgr.this.mProgress.show();
        MicActivity.s_bIsInSendMail = Boolean.valueOf(true);
        return;
      case 1:
        MailMgr.this.mProgress.dismiss();
        MicActivity.s_bIsInSendMail = Boolean.valueOf(false);
        return;
      case 2:
        Toast.makeText(MicActivity.s_CurrActivity, "发送成功", 0).show();
        return;
      case 3:
      }
      Toast.makeText(MicActivity.s_CurrActivity, "发送失败", 0).show();
    }
  };
  ProgressDialog mProgress;
  String mStrContent;
  String mStrSubject;

  public void SendMail(String paramString1, String paramString2)
  {
    MailThread localMailThread = new MailThread(this);
    this.mStrSubject = paramString1;
    this.mStrContent = paramString2;
    localMailThread.start();
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.qqgame.mrzerg.mail.MailMgr
 * JD-Core Version:    0.6.2
 */