package com.sun.mail.imap.protocol;

import java.util.Vector;

public class UIDSet
{
  public long end;
  public long start;

  public UIDSet()
  {
  }

  public UIDSet(long paramLong1, long paramLong2)
  {
    this.start = paramLong1;
    this.end = paramLong2;
  }

  public static UIDSet[] createUIDSets(long[] paramArrayOfLong)
  {
    Vector localVector = new Vector();
    int i = 0;
    if (i >= paramArrayOfLong.length)
    {
      UIDSet[] arrayOfUIDSet = new UIDSet[localVector.size()];
      localVector.copyInto(arrayOfUIDSet);
      return arrayOfUIDSet;
    }
    UIDSet localUIDSet = new UIDSet();
    localUIDSet.start = paramArrayOfLong[i];
    for (int j = i + 1; ; j++)
    {
      if (j >= paramArrayOfLong.length);
      while (paramArrayOfLong[j] != 1L + paramArrayOfLong[(j - 1)])
      {
        localUIDSet.end = paramArrayOfLong[(j - 1)];
        localVector.addElement(localUIDSet);
        i = 1 + (j - 1);
        break;
      }
    }
  }

  public static long size(UIDSet[] paramArrayOfUIDSet)
  {
    long l = 0L;
    if (paramArrayOfUIDSet == null)
      return 0L;
    for (int i = 0; ; i++)
    {
      if (i >= paramArrayOfUIDSet.length)
        return l;
      l += paramArrayOfUIDSet[i].size();
    }
  }

  public static String toString(UIDSet[] paramArrayOfUIDSet)
  {
    if ((paramArrayOfUIDSet == null) || (paramArrayOfUIDSet.length == 0))
      return null;
    int i = 0;
    StringBuffer localStringBuffer = new StringBuffer();
    int j = paramArrayOfUIDSet.length;
    while (true)
    {
      long l1 = paramArrayOfUIDSet[i].start;
      long l2 = paramArrayOfUIDSet[i].end;
      if (l2 > l1)
        localStringBuffer.append(l1).append(':').append(l2);
      while (true)
      {
        i++;
        if (i < j)
          break;
        return localStringBuffer.toString();
        localStringBuffer.append(l1);
      }
      localStringBuffer.append(',');
    }
  }

  public long size()
  {
    return 1L + (this.end - this.start);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.protocol.UIDSet
 * JD-Core Version:    0.6.2
 */