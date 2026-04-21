package com.qqgame.mic;

import android.content.Context;
import android.util.Log;
import android.view.MotionEvent;
import android.widget.ImageView;

public class MyImageView extends ImageView
{
  public MyImageViewProperty imageproperty = null;

  public MyImageView(Context paramContext)
  {
    super(paramContext);
    try
    {
      this.imageproperty = new MyImageViewProperty();
      return;
    }
    catch (Exception localException)
    {
      localException.printStackTrace();
    }
  }

  public boolean onTouchEvent(MotionEvent paramMotionEvent)
  {
    switch (0xFF & paramMotionEvent.getAction())
    {
    default:
    case 1:
    }
    while (true)
    {
      return true;
      Log.i("hlddz", "MotionEvent.ACTION_UP");
      if (MicActivity.isStartedFromHall())
      {
        Log.i("hlddz", "refreshVerifyCode");
        MyImageViewMgr.refreshVerifyCode();
      }
      else
      {
        Log.i("hlddz", "MyImageViewMgr.RequestURL");
        MyImageViewMgr.RequestURL(this.imageproperty.nID, this.imageproperty.strURL);
      }
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.qqgame.mic.MyImageView
 * JD-Core Version:    0.6.2
 */