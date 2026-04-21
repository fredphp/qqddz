package com.sun.mail.imap;

public class AppendUID
{
  public long uid = -1L;
  public long uidvalidity = -1L;

  public AppendUID(long paramLong1, long paramLong2)
  {
    this.uidvalidity = paramLong1;
    this.uid = paramLong2;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.AppendUID
 * JD-Core Version:    0.6.2
 */