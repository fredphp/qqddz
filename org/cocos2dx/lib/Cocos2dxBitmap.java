package org.cocos2dx.lib;

import android.graphics.Bitmap;
import android.graphics.Bitmap.Config;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Paint.Align;
import android.graphics.Paint.FontMetricsInt;
import android.graphics.Typeface;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.LinkedList;

public class Cocos2dxBitmap
{
  private static final int ALIGNCENTER = 51;
  private static final int ALIGNLEFT = 49;
  private static final int ALIGNRIGHT = 50;

  private static int computeX(Paint paramPaint, String paramString, int paramInt1, int paramInt2)
  {
    switch (paramInt2)
    {
    case 49:
    default:
      return 0;
    case 51:
      return paramInt1 / 2;
    case 50:
    }
    return paramInt1;
  }

  public static void createTextBitmap(String paramString1, String paramString2, int paramInt1, int paramInt2, int paramInt3, int paramInt4)
  {
    if (paramString1.compareTo("") == 0)
      paramString1 = " ";
    Paint localPaint = newPaint(paramString2, paramInt1, paramInt2);
    TextProperty localTextProperty = getTextWidthAndHeight(paramString1, localPaint, paramInt3, paramInt4);
    Bitmap localBitmap = Bitmap.createBitmap(localTextProperty.maxWidth, localTextProperty.totalHeight, Bitmap.Config.ARGB_8888);
    Canvas localCanvas = new Canvas(localBitmap);
    int i = -localPaint.getFontMetricsInt().ascent;
    for (String str : localTextProperty.lines)
    {
      localCanvas.drawText(str, computeX(localPaint, str, localTextProperty.maxWidth, paramInt2), i, localPaint);
      i += localTextProperty.heightPerLine;
    }
    initNativeObject(localBitmap);
  }

  private static LinkedList<String> divideStringWithMaxWidth(Paint paramPaint, String paramString, int paramInt)
  {
    int i = paramString.length();
    int j = 0;
    LinkedList localLinkedList = new LinkedList();
    int k = 1;
    if (k <= i)
    {
      int m = (int)Math.ceil(paramPaint.measureText(paramString, j, k));
      if (m >= paramInt)
      {
        int n = paramString.substring(0, k).lastIndexOf(" ");
        if (n == -1)
          break label96;
        localLinkedList.add(paramString.substring(j, n));
        k = n;
      }
      while (true)
      {
        j = k;
        k++;
        break;
        label96: if (m > paramInt)
        {
          localLinkedList.add(paramString.substring(j, k - 1));
          k--;
        }
        else
        {
          localLinkedList.add(paramString.substring(j, k));
        }
      }
    }
    if (j == i - 1)
      localLinkedList.add(paramString.substring(i - 1));
    return localLinkedList;
  }

  private static byte[] getPixels(Bitmap paramBitmap)
  {
    if (paramBitmap != null)
    {
      byte[] arrayOfByte = new byte[4 * (paramBitmap.getWidth() * paramBitmap.getHeight())];
      ByteBuffer localByteBuffer = ByteBuffer.wrap(arrayOfByte);
      localByteBuffer.order(ByteOrder.nativeOrder());
      paramBitmap.copyPixelsToBuffer(localByteBuffer);
      return arrayOfByte;
    }
    return null;
  }

  private static TextProperty getTextWidthAndHeight(String paramString, Paint paramPaint, int paramInt1, int paramInt2)
  {
    Paint.FontMetricsInt localFontMetricsInt = paramPaint.getFontMetricsInt();
    int i = (int)Math.ceil(localFontMetricsInt.descent - localFontMetricsInt.ascent);
    int j = 0;
    String[] arrayOfString = splitString(paramString, paramInt2, paramInt1, paramPaint);
    if (paramInt1 != 0)
      j = paramInt1;
    while (true)
    {
      return new TextProperty(j, i, arrayOfString);
      int k = arrayOfString.length;
      for (int m = 0; m < k; m++)
      {
        String str = arrayOfString[m];
        int n = (int)Math.ceil(paramPaint.measureText(str, 0, str.length()));
        if (n > j)
          j = n;
      }
    }
  }

  private static void initNativeObject(Bitmap paramBitmap)
  {
    byte[] arrayOfByte = getPixels(paramBitmap);
    if (arrayOfByte == null)
      return;
    nativeInitBitmapDC(paramBitmap.getWidth(), paramBitmap.getHeight(), arrayOfByte);
  }

  private static native void nativeInitBitmapDC(int paramInt1, int paramInt2, byte[] paramArrayOfByte);

  private static Paint newPaint(String paramString, int paramInt1, int paramInt2)
  {
    Paint localPaint = new Paint();
    localPaint.setColor(-1);
    localPaint.setTextSize(paramInt1);
    localPaint.setTypeface(Typeface.create(paramString, 0));
    localPaint.setAntiAlias(true);
    switch (paramInt2)
    {
    default:
      localPaint.setTextAlign(Paint.Align.LEFT);
      return localPaint;
    case 51:
      localPaint.setTextAlign(Paint.Align.CENTER);
      return localPaint;
    case 49:
      localPaint.setTextAlign(Paint.Align.LEFT);
      return localPaint;
    case 50:
    }
    localPaint.setTextAlign(Paint.Align.RIGHT);
    return localPaint;
  }

  private static String[] splitString(String paramString, int paramInt1, int paramInt2, Paint paramPaint)
  {
    String[] arrayOfString1 = paramString.split("\\n");
    Paint.FontMetricsInt localFontMetricsInt = paramPaint.getFontMetricsInt();
    int i = paramInt1 / (int)Math.ceil(localFontMetricsInt.descent - localFontMetricsInt.ascent);
    if (paramInt2 != 0)
    {
      LinkedList localLinkedList1 = new LinkedList();
      int j = arrayOfString1.length;
      for (int k = 0; ; k++)
      {
        String str;
        if (k < j)
        {
          str = arrayOfString1[k];
          if ((int)Math.ceil(paramPaint.measureText(str)) <= paramInt2)
            break label146;
          localLinkedList1.addAll(divideStringWithMaxWidth(paramPaint, str, paramInt2));
        }
        while ((i > 0) && (localLinkedList1.size() >= i))
        {
          if ((i <= 0) || (localLinkedList1.size() <= i))
            break label163;
          while (localLinkedList1.size() > i)
            localLinkedList1.removeLast();
          label146: localLinkedList1.add(str);
        }
      }
      label163: String[] arrayOfString2 = new String[localLinkedList1.size()];
      localLinkedList1.toArray(arrayOfString2);
      return arrayOfString2;
    }
    if ((paramInt1 != 0) && (arrayOfString1.length > i))
    {
      LinkedList localLinkedList2 = new LinkedList();
      for (int m = 0; m < i; m++)
        localLinkedList2.add(arrayOfString1[m]);
      String[] arrayOfString3 = new String[localLinkedList2.size()];
      localLinkedList2.toArray(arrayOfString3);
      return arrayOfString3;
    }
    return arrayOfString1;
  }

  private static class TextProperty
  {
    int heightPerLine;
    String[] lines;
    int maxWidth;
    int totalHeight;

    TextProperty(int paramInt1, int paramInt2, String[] paramArrayOfString)
    {
      this.maxWidth = paramInt1;
      this.heightPerLine = paramInt2;
      this.totalHeight = (paramInt2 * paramArrayOfString.length);
      this.lines = paramArrayOfString;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.cocos2dx.lib.Cocos2dxBitmap
 * JD-Core Version:    0.6.2
 */