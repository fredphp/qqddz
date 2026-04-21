package com.sun.mail.imap;

import com.sun.mail.imap.protocol.MessageSet;
import com.sun.mail.imap.protocol.UIDSet;
import java.util.Vector;
import javax.mail.Message;

public final class Utility
{
  public static MessageSet[] toMessageSet(Message[] paramArrayOfMessage, Condition paramCondition)
  {
    Vector localVector = new Vector(1);
    int i = 0;
    if (i >= paramArrayOfMessage.length)
    {
      if (localVector.isEmpty())
        return null;
    }
    else
    {
      IMAPMessage localIMAPMessage1 = (IMAPMessage)paramArrayOfMessage[i];
      if (localIMAPMessage1.isExpunged());
      int j;
      do
      {
        i++;
        break;
        j = localIMAPMessage1.getSequenceNumber();
      }
      while ((paramCondition != null) && (!paramCondition.test(localIMAPMessage1)));
      MessageSet localMessageSet = new MessageSet();
      localMessageSet.start = j;
      i++;
      if (i >= paramArrayOfMessage.length);
      while (true)
      {
        localMessageSet.end = j;
        localVector.addElement(localMessageSet);
        break;
        IMAPMessage localIMAPMessage2 = (IMAPMessage)paramArrayOfMessage[i];
        if (localIMAPMessage2.isExpunged());
        while (true)
        {
          i++;
          break;
          int k = localIMAPMessage2.getSequenceNumber();
          if ((paramCondition == null) || (paramCondition.test(localIMAPMessage2)))
          {
            if (k != j + 1)
              break label171;
            j = k;
          }
        }
        label171: i--;
      }
    }
    MessageSet[] arrayOfMessageSet = new MessageSet[localVector.size()];
    localVector.copyInto(arrayOfMessageSet);
    return arrayOfMessageSet;
  }

  public static UIDSet[] toUIDSet(Message[] paramArrayOfMessage)
  {
    Vector localVector = new Vector(1);
    IMAPMessage localIMAPMessage1;
    for (int i = 0; ; i++)
    {
      if (i >= paramArrayOfMessage.length)
      {
        if (!localVector.isEmpty())
          break label145;
        return null;
      }
      localIMAPMessage1 = (IMAPMessage)paramArrayOfMessage[i];
      if (!localIMAPMessage1.isExpunged())
        break;
    }
    long l1 = localIMAPMessage1.getUID();
    UIDSet localUIDSet = new UIDSet();
    localUIDSet.start = l1;
    i++;
    if (i >= paramArrayOfMessage.length);
    while (true)
    {
      localUIDSet.end = l1;
      localVector.addElement(localUIDSet);
      break;
      IMAPMessage localIMAPMessage2 = (IMAPMessage)paramArrayOfMessage[i];
      if (localIMAPMessage2.isExpunged());
      while (true)
      {
        i++;
        break;
        long l2 = localIMAPMessage2.getUID();
        if (l2 != 1L + l1)
          break label139;
        l1 = l2;
      }
      label139: i--;
    }
    label145: UIDSet[] arrayOfUIDSet = new UIDSet[localVector.size()];
    localVector.copyInto(arrayOfUIDSet);
    return arrayOfUIDSet;
  }

  public static abstract interface Condition
  {
    public abstract boolean test(IMAPMessage paramIMAPMessage);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.Utility
 * JD-Core Version:    0.6.2
 */