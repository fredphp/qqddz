package com.qqgame.mrzerg.mail;

import android.os.Handler;
import android.util.Log;

class MailThread
{
  private MailMgr mMailMgr;

  public MailThread(MailMgr paramMailMgr)
  {
    this.mMailMgr = paramMailMgr;
  }

  public void start()
  {
    new Thread(new Runnable()
    {
      public void run()
      {
        MailSender localMailSender = new MailSender();
        MailThread.this.mMailMgr.mHandler.sendEmptyMessage(0);
        try
        {
          localMailSender.sendMail(MailThread.this.mMailMgr.mStrSubject, MailThread.this.mMailMgr.mStrContent, "huanlegame@qq.com", "huanlegame@qq.com");
          Log.d("Mail", "sent: " + MailThread.this.mMailMgr.mStrContent);
          MailThread.this.mMailMgr.mHandler.sendEmptyMessage(2);
          MailThread.this.mMailMgr.mHandler.sendEmptyMessage(1);
          return;
        }
        catch (Exception localException)
        {
          while (true)
          {
            MailThread.this.mMailMgr.mHandler.sendEmptyMessage(3);
            localException.printStackTrace();
            Log.d("Mail", localException.getMessage());
          }
        }
      }
    }).start();
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.qqgame.mrzerg.mail.MailThread
 * JD-Core Version:    0.6.2
 */