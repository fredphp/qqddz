package com.qqgame.mic;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Handler;
import android.os.Message;
import android.util.Log;
import android.widget.ImageView.ScaleType;
import android.widget.RelativeLayout;
import android.widget.RelativeLayout.LayoutParams;
import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map.Entry;
import java.util.Set;

public class MyImageViewMgr
{
  private static final int HANDLER_ADJUST_IMAGEVIEW = 22;
  private static final int HANDLER_CREATE_IMAGEVIEW = 21;
  private static final int HANDLER_DESTROY_IMAGEVIEW = 23;
  private static final int HANDLER_HIDE_IMAGEVIEW = 24;
  public static final int HANDLER_IMAGE_BEGIN = 21;
  public static final int HANDLER_IMAGE_END = 26;
  private static final int HANDLER_REQUESTURL_IMAGEVIEW = 26;
  private static final int HANDLER_SHOW_IMAGEVIEW = 25;
  private static int s_ImageView_ID = 0;
  public static Bitmap s_bitmap = null;
  public static boolean s_isInRequestUrl = false;
  private static HashMap<Integer, MyImageView> s_mImageViewMap;

  public MyImageViewMgr()
  {
    if (s_mImageViewMap == null)
      s_mImageViewMap = new HashMap();
  }

  private void AdjustImageV(int paramInt, int[] paramArrayOfInt)
  {
    MyImageView localMyImageView = (MyImageView)s_mImageViewMap.get(Integer.valueOf(paramInt));
    if (localMyImageView != null)
    {
      RelativeLayout.LayoutParams localLayoutParams = new RelativeLayout.LayoutParams(-2, -2);
      localLayoutParams.addRule(9);
      localLayoutParams.addRule(10);
      localLayoutParams.leftMargin = paramArrayOfInt[0];
      localLayoutParams.topMargin = paramArrayOfInt[1];
      localLayoutParams.width = (1 + paramArrayOfInt[2]);
      localLayoutParams.height = (1 + paramArrayOfInt[3]);
      localMyImageView.setLayoutParams(localLayoutParams);
      localMyImageView.imageproperty.rect = paramArrayOfInt;
      Log.i("MyEditTextMgr", "CNativeEdit>>AdjustEdit(" + paramInt + ") rect(" + paramArrayOfInt[0] + ", " + paramArrayOfInt[1] + ", " + paramArrayOfInt[2] + ", " + paramArrayOfInt[3] + ")");
    }
  }

  public static void AdjustLayout(int paramInt1, int paramInt2, int paramInt3, int paramInt4, int paramInt5)
  {
    if (paramInt1 > 0)
    {
      int[] arrayOfInt = { paramInt2, paramInt3, paramInt4, paramInt5 };
      Message localMessage = MicActivity.s_handler.obtainMessage();
      localMessage.what = 22;
      localMessage.arg1 = paramInt1;
      localMessage.obj = arrayOfInt;
      MicActivity.s_handler.sendMessage(localMessage);
    }
  }

  private void CreateImageV(int paramInt, int[] paramArrayOfInt)
  {
    MyImageView localMyImageView1 = new MyImageView(MicActivity.s_CurrActivity);
    if (localMyImageView1 != null)
    {
      RelativeLayout.LayoutParams localLayoutParams = new RelativeLayout.LayoutParams(-2, -2);
      localLayoutParams.addRule(9);
      localLayoutParams.addRule(10);
      localLayoutParams.leftMargin = paramArrayOfInt[0];
      localLayoutParams.topMargin = paramArrayOfInt[1];
      localLayoutParams.width = (1 + paramArrayOfInt[2]);
      localLayoutParams.height = (1 + paramArrayOfInt[3]);
      localMyImageView1.setLayoutParams(localLayoutParams);
      localMyImageView1.imageproperty.nID = paramInt;
      localMyImageView1.imageproperty.rect = paramArrayOfInt;
      localMyImageView1.setScaleType(ImageView.ScaleType.FIT_XY);
      MyImageView localMyImageView2 = (MyImageView)s_mImageViewMap.get(Integer.valueOf(paramInt));
      if (localMyImageView2 != null)
        MicActivity.s_layout.removeView(localMyImageView2);
      s_mImageViewMap.put(Integer.valueOf(paramInt), localMyImageView1);
      MicActivity.s_layout.addView(localMyImageView1);
    }
  }

  public static int CreateImageView(int paramInt1, int paramInt2, int paramInt3, int paramInt4, int paramInt5)
  {
    if ((MicActivity.s_CurrActivity != null) && (MicActivity.s_layout != null))
    {
      if (paramInt5 == 0)
      {
        paramInt5 = 1 + s_ImageView_ID;
        s_ImageView_ID = paramInt5;
      }
      int[] arrayOfInt = { paramInt1, paramInt2, paramInt3, paramInt4 };
      Message localMessage = MicActivity.s_handler.obtainMessage();
      localMessage.what = 21;
      localMessage.arg1 = paramInt5;
      localMessage.obj = arrayOfInt;
      MicActivity.s_handler.sendMessage(localMessage);
    }
    return paramInt5;
  }

  private void DestroyImageV(int paramInt)
  {
    MyImageView localMyImageView = (MyImageView)s_mImageViewMap.get(Integer.valueOf(paramInt));
    if (localMyImageView != null)
    {
      localMyImageView.imageproperty.nID = 0;
      MicActivity.s_layout.removeView(localMyImageView);
      s_mImageViewMap.remove(Integer.valueOf(paramInt));
    }
  }

  public static void DestroyImageView(int paramInt)
  {
    if (paramInt > 0)
    {
      Message localMessage = MicActivity.s_handler.obtainMessage();
      localMessage.what = 23;
      localMessage.arg1 = paramInt;
      MicActivity.s_handler.sendMessage(localMessage);
    }
  }

  private void HideImageV(int paramInt)
  {
    MyImageView localMyImageView = (MyImageView)s_mImageViewMap.get(Integer.valueOf(paramInt));
    if (localMyImageView != null)
      localMyImageView.setVisibility(4);
  }

  public static void HideImageView(int paramInt)
  {
    if (paramInt > 0)
    {
      Message localMessage = MicActivity.s_handler.obtainMessage();
      localMessage.what = 24;
      localMessage.arg1 = paramInt;
      MicActivity.s_handler.sendMessage(localMessage);
    }
  }

  public static void RequestURL(int paramInt, String paramString)
  {
    if (s_isInRequestUrl)
      return;
    s_isInRequestUrl = true;
    new downloadTask(paramInt, paramString).start();
  }

  public static void RequestUrltask(int paramInt, String paramString)
    throws IOException
  {
    MyImageView localMyImageView = (MyImageView)s_mImageViewMap.get(Integer.valueOf(paramInt));
    if (localMyImageView != null)
    {
      if (!MicActivity.isStartedFromHall())
        break label108;
      BufferedInputStream localBufferedInputStream1 = new BufferedInputStream(new FileInputStream(paramString));
      BufferedInputStream localBufferedInputStream2 = new BufferedInputStream(localBufferedInputStream1);
      s_bitmap = BitmapFactory.decodeStream(localBufferedInputStream2);
      localBufferedInputStream2.close();
      localBufferedInputStream1.close();
    }
    while (true)
    {
      if (paramInt > 0)
      {
        Message localMessage = MicActivity.s_handler.obtainMessage();
        localMessage.what = 26;
        localMessage.arg1 = paramInt;
        localMessage.obj = paramString;
        MicActivity.s_handler.sendMessage(localMessage);
      }
      return;
      try
      {
        label108: Log.i("MyImageViewMgr", "CNativeImage>>RequestUrl:" + paramString);
        localMyImageView.imageproperty.strURL = paramString;
        URL localURL2 = new URL(paramString);
        localURL1 = localURL2;
        try
        {
          HttpURLConnection localHttpURLConnection = (HttpURLConnection)localURL1.openConnection();
          localHttpURLConnection.connect();
          nativeSetQQSessionStr(localHttpURLConnection.getHeaderField("Getqqsession"));
          InputStream localInputStream = localHttpURLConnection.getInputStream();
          BufferedInputStream localBufferedInputStream3 = new BufferedInputStream(localInputStream);
          s_bitmap = BitmapFactory.decodeStream(localBufferedInputStream3);
          localBufferedInputStream3.close();
          localInputStream.close();
        }
        catch (IOException localIOException)
        {
          localIOException.printStackTrace();
        }
      }
      catch (MalformedURLException localMalformedURLException)
      {
        while (true)
        {
          localMalformedURLException.printStackTrace();
          URL localURL1 = null;
        }
      }
    }
  }

  private void SetBmp(int paramInt, String paramString)
  {
    MyImageView localMyImageView = (MyImageView)s_mImageViewMap.get(Integer.valueOf(paramInt));
    if (localMyImageView != null)
      localMyImageView.setImageBitmap(s_bitmap);
  }

  private void ShowImageV(int paramInt)
  {
    MyImageView localMyImageView = (MyImageView)s_mImageViewMap.get(Integer.valueOf(paramInt));
    if (localMyImageView != null)
      localMyImageView.setVisibility(0);
  }

  public static void ShowImageView(int paramInt)
  {
    if (paramInt > 0)
    {
      Message localMessage = MicActivity.s_handler.obtainMessage();
      localMessage.what = 25;
      localMessage.arg1 = paramInt;
      MicActivity.s_handler.sendMessage(localMessage);
    }
  }

  private static native void nativeSetQQSessionStr(String paramString);

  public static native void refreshVerifyCode();

  public void CloneImageViewByProperty(HashMap<Integer, MyImageViewProperty> paramHashMap)
  {
    if (paramHashMap != null)
    {
      Iterator localIterator = paramHashMap.entrySet().iterator();
      while (localIterator.hasNext())
      {
        Map.Entry localEntry = (Map.Entry)localIterator.next();
        int i = ((Integer)localEntry.getKey()).intValue();
        MyImageViewProperty localMyImageViewProperty = (MyImageViewProperty)localEntry.getValue();
        CreateImageView(localMyImageViewProperty.rect[0], localMyImageViewProperty.rect[1], localMyImageViewProperty.rect[2], localMyImageViewProperty.rect[3], i);
        RequestURL(i, localMyImageViewProperty.strURL);
        if (localMyImageViewProperty.bVisible)
          ShowImageView(i);
        else
          HideImageView(i);
      }
    }
  }

  public void GetImageViewsProperty(HashMap<Integer, MyImageViewProperty> paramHashMap)
  {
    if (paramHashMap != null)
    {
      paramHashMap.clear();
      Iterator localIterator = s_mImageViewMap.entrySet().iterator();
      while (localIterator.hasNext())
      {
        Map.Entry localEntry = (Map.Entry)localIterator.next();
        paramHashMap.put(localEntry.getKey(), ((MyImageView)localEntry.getValue()).imageproperty);
      }
    }
  }

  public void ProcessMsg(Message paramMessage)
  {
    switch (paramMessage.what)
    {
    default:
      return;
    case 21:
      CreateImageV(paramMessage.arg1, (int[])paramMessage.obj);
      return;
    case 22:
      AdjustImageV(paramMessage.arg1, (int[])paramMessage.obj);
      return;
    case 23:
      DestroyImageV(paramMessage.arg1);
      return;
    case 24:
      HideImageV(paramMessage.arg1);
      return;
    case 25:
      ShowImageV(paramMessage.arg1);
      return;
    case 26:
    }
    SetBmp(paramMessage.arg1, (String)paramMessage.obj);
    s_isInRequestUrl = false;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.qqgame.mic.MyImageViewMgr
 * JD-Core Version:    0.6.2
 */