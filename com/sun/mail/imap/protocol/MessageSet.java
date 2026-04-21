package com.sun.mail.imap.protocol;

import java.util.Vector;

public class MessageSet
{
  public int end;
  public int start;

  public MessageSet()
  {
  }

  public MessageSet(int paramInt1, int paramInt2)
  {
    this.start = paramInt1;
    this.end = paramInt2;
  }

  public static MessageSet[] createMessageSets(int[] paramArrayOfInt)
  {
    Vector localVector = new Vector();
    int i = 0;
    if (i >= paramArrayOfInt.length)
    {
      MessageSet[] arrayOfMessageSet = new MessageSet[localVector.size()];
      localVector.copyInto(arrayOfMessageSet);
      return arrayOfMessageSet;
    }
    MessageSet localMessageSet = new MessageSet();
    localMessageSet.start = paramArrayOfInt[i];
    for (int j = i + 1; ; j++)
    {
      if (j >= paramArrayOfInt.length);
      while (paramArrayOfInt[j] != 1 + paramArrayOfInt[(j - 1)])
      {
        localMessageSet.end = paramArrayOfInt[(j - 1)];
        localVector.addElement(localMessageSet);
        i = 1 + (j - 1);
        break;
      }
    }
  }

  public static int size(MessageSet[] paramArrayOfMessageSet)
  {
    int i = 0;
    if (paramArrayOfMessageSet == null)
      return 0;
    for (int j = 0; ; j++)
    {
      if (j >= paramArrayOfMessageSet.length)
        return i;
      i += paramArrayOfMessageSet[j].size();
    }
  }

  public static String toString(MessageSet[] paramArrayOfMessageSet)
  {
    if ((paramArrayOfMessageSet == null) || (paramArrayOfMessageSet.length == 0))
      return null;
    int i = 0;
    StringBuffer localStringBuffer = new StringBuffer();
    int j = paramArrayOfMessageSet.length;
    while (true)
    {
      int k = paramArrayOfMessageSet[i].start;
      int m = paramArrayOfMessageSet[i].end;
      if (m > k)
        localStringBuffer.append(k).append(':').append(m);
      while (true)
      {
        i++;
        if (i < j)
          break;
        return localStringBuffer.toString();
        localStringBuffer.append(k);
      }
      localStringBuffer.append(',');
    }
  }

  public int size()
  {
    return 1 + (this.end - this.start);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.protocol.MessageSet
 * JD-Core Version:    0.6.2
 */