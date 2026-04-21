package com.sun.mail.imap.protocol;

import com.sun.mail.iap.ParsingException;
import javax.mail.Flags;
import javax.mail.Flags.Flag;

public class FLAGS extends Flags
  implements Item
{
  static final char[] name = { 70, 76, 65, 71, 83 };
  private static final long serialVersionUID = 439049847053756670L;
  public int msgno;

  public FLAGS(IMAPResponse paramIMAPResponse)
    throws ParsingException
  {
    this.msgno = paramIMAPResponse.getNumber();
    paramIMAPResponse.skipSpaces();
    String[] arrayOfString = paramIMAPResponse.readSimpleList();
    int i;
    if (arrayOfString != null)
    {
      i = 0;
      if (i < arrayOfString.length);
    }
    else
    {
      return;
    }
    String str = arrayOfString[i];
    if ((str.length() >= 2) && (str.charAt(0) == '\\'))
      switch (Character.toUpperCase(str.charAt(1)))
      {
      default:
        add(str);
      case 'S':
      case 'R':
      case 'D':
      case 'A':
      case 'F':
      case '*':
      }
    while (true)
    {
      i++;
      break;
      add(Flags.Flag.SEEN);
      continue;
      add(Flags.Flag.RECENT);
      continue;
      if (str.length() >= 3)
      {
        int j = str.charAt(2);
        if ((j == 101) || (j == 69))
          add(Flags.Flag.DELETED);
        else if ((j == 114) || (j == 82))
          add(Flags.Flag.DRAFT);
      }
      else
      {
        add(str);
        continue;
        add(Flags.Flag.ANSWERED);
        continue;
        add(Flags.Flag.FLAGGED);
        continue;
        add(Flags.Flag.USER);
        continue;
        add(str);
      }
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.protocol.FLAGS
 * JD-Core Version:    0.6.2
 */