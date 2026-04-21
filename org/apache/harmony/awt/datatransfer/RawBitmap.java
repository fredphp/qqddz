package org.apache.harmony.awt.datatransfer;

public final class RawBitmap
{
  public final int bMask;
  public final int bits;
  public final Object buffer;
  public final int gMask;
  public final int height;
  public final int rMask;
  public final int stride;
  public final int width;

  public RawBitmap(int paramInt1, int paramInt2, int paramInt3, int paramInt4, int paramInt5, int paramInt6, int paramInt7, Object paramObject)
  {
    this.width = paramInt1;
    this.height = paramInt2;
    this.stride = paramInt3;
    this.bits = paramInt4;
    this.rMask = paramInt5;
    this.gMask = paramInt6;
    this.bMask = paramInt7;
    this.buffer = paramObject;
  }

  public RawBitmap(int[] paramArrayOfInt, Object paramObject)
  {
    this.width = paramArrayOfInt[0];
    this.height = paramArrayOfInt[1];
    this.stride = paramArrayOfInt[2];
    this.bits = paramArrayOfInt[3];
    this.rMask = paramArrayOfInt[4];
    this.gMask = paramArrayOfInt[5];
    this.bMask = paramArrayOfInt[6];
    this.buffer = paramObject;
  }

  public int[] getHeader()
  {
    int[] arrayOfInt = new int[7];
    arrayOfInt[0] = this.width;
    arrayOfInt[1] = this.height;
    arrayOfInt[2] = this.stride;
    arrayOfInt[3] = this.bits;
    arrayOfInt[4] = this.rMask;
    arrayOfInt[5] = this.gMask;
    arrayOfInt[6] = this.bMask;
    return arrayOfInt;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.apache.harmony.awt.datatransfer.RawBitmap
 * JD-Core Version:    0.6.2
 */