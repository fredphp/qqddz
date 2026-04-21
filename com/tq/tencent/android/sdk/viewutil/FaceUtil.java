package com.tq.tencent.android.sdk.viewutil;

import android.graphics.Bitmap;
import android.graphics.Bitmap.Config;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.PorterDuff.Mode;
import android.graphics.PorterDuffXfermode;
import android.graphics.Rect;
import android.graphics.RectF;
import com.tq.tencent.android.sdk.common.CommonUtil;
import java.io.File;

public class FaceUtil
{
  public static final long ICON_TIME_OUT = 259200000L;
  private static final String TAG = FaceUtil.class.getSimpleName();
  private static final String TQ_SDK_PHOTO_FOLDER = ".tqsdk";
  public static final String USERFACEFILE_DIRECTORY = CommonUtil.SDCARD_PATH + File.separator + ".tqsdk";

  public static void cleanFaceByUserAccount(String paramString)
  {
    File localFile = new File(userFaceBasePath(paramString));
    File[] arrayOfFile;
    int i;
    if ((localFile.exists()) && (localFile.isDirectory()))
    {
      arrayOfFile = localFile.listFiles();
      i = arrayOfFile.length;
    }
    for (int j = 0; ; j++)
    {
      if (j >= i)
      {
        localFile.delete();
        return;
      }
      arrayOfFile[j].delete();
    }
  }

  public static Bitmap getRoundedCornerBitmap(Bitmap paramBitmap, float paramFloat)
  {
    if (paramBitmap == null)
      return null;
    Bitmap localBitmap = Bitmap.createBitmap(paramBitmap.getWidth(), paramBitmap.getHeight(), Bitmap.Config.ARGB_8888);
    Canvas localCanvas = new Canvas(localBitmap);
    Paint localPaint = new Paint();
    Rect localRect = new Rect(0, 0, paramBitmap.getWidth(), paramBitmap.getHeight());
    RectF localRectF = new RectF(localRect);
    localPaint.setAntiAlias(true);
    localCanvas.drawARGB(0, 0, 0, 0);
    localPaint.setColor(-12434878);
    localCanvas.drawRoundRect(localRectF, paramFloat, paramFloat, localPaint);
    localPaint.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.SRC_IN));
    localCanvas.drawBitmap(paramBitmap, localRect, localRect, localPaint);
    return localBitmap;
  }

  public static Bitmap getRoundedCornerBitmap(byte[] paramArrayOfByte, float paramFloat)
  {
    return getRoundedCornerBitmap(BitmapFactory.decodeByteArray(paramArrayOfByte, 0, paramArrayOfByte.length), paramFloat);
  }

  public static String uinToSDCardFileName(String paramString1, String paramString2)
  {
    if (paramString1 != null)
      return USERFACEFILE_DIRECTORY + File.separator + paramString1 + File.separator + paramString2 + ".png";
    return "";
  }

  public static String userFaceBasePath(String paramString)
  {
    if (paramString != null)
      return USERFACEFILE_DIRECTORY + File.separator + paramString;
    return "";
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.viewutil.FaceUtil
 * JD-Core Version:    0.6.2
 */