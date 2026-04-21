package com.tq.tencent.android.sdk.common;

import com.tq.tencent.android.sdk.cp_config.AppInfoConfig;

public class ParseSocketMsg
{
  public static byte[] QGEncodeSocketMsg(byte[] paramArrayOfByte1, byte[] paramArrayOfByte2)
  {
    if ((paramArrayOfByte2 == null) || (paramArrayOfByte2.length < 2) || ((paramArrayOfByte1 != null) && (paramArrayOfByte1.length < 2)))
      return null;
    Logger.debug("--QGEncodeSocketMsg head.length=" + paramArrayOfByte1.length + ",body.length=" + paramArrayOfByte2.length);
    int i = -2 + paramArrayOfByte2.length;
    paramArrayOfByte2[0] = ((byte)(0xFF & i >>> 8));
    paramArrayOfByte2[1] = ((byte)(0xFF & i >>> 0));
    Logger.debug("--QGEncodeSocketMsg=v=" + i);
    byte[] arrayOfByte;
    if (paramArrayOfByte1 != null)
    {
      arrayOfByte = new byte[paramArrayOfByte2.length + paramArrayOfByte1.length];
      System.arraycopy(paramArrayOfByte1, 0, arrayOfByte, 0, paramArrayOfByte1.length);
      System.arraycopy(paramArrayOfByte2, 0, arrayOfByte, paramArrayOfByte1.length, paramArrayOfByte2.length);
    }
    while (true)
    {
      int j = arrayOfByte.length;
      arrayOfByte[0] = ((byte)(0xFF & j >>> 8));
      arrayOfByte[1] = ((byte)(0xFF & j >>> 0));
      Logger.debug("--QGEncodeSocketMsg=msg.length=" + arrayOfByte.length);
      return arrayOfByte;
      arrayOfByte = paramArrayOfByte2;
    }
  }

  public static byte[] handleGetSocketHeadRequest(int paramInt1, int paramInt2, int paramInt3, String paramString)
  {
    OpenBytesWriter localOpenBytesWriter = new OpenBytesWriter();
    localOpenBytesWriter.writeShort(0);
    localOpenBytesWriter.writeShort(256);
    localOpenBytesWriter.writeChar(paramInt1);
    localOpenBytesWriter.writeInt(paramInt2);
    localOpenBytesWriter.writeInt(Integer.parseInt(AppInfoConfig.getAppId()));
    localOpenBytesWriter.writeShort(paramInt3);
    localOpenBytesWriter.writeUTF1("");
    localOpenBytesWriter.writeUTF1(null);
    return localOpenBytesWriter.toMsgByteArray();
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.common.ParseSocketMsg
 * JD-Core Version:    0.6.2
 */