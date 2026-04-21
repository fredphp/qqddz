package com.sun.mail.imap.protocol;

import com.sun.mail.iap.ParsingException;
import java.util.Vector;

public class ListInfo
{
  public static final int CHANGED = 1;
  public static final int INDETERMINATE = 3;
  public static final int UNCHANGED = 2;
  public String[] attrs;
  public boolean canOpen = true;
  public int changeState = 3;
  public boolean hasInferiors = true;
  public String name = null;
  public char separator = '/';

  public ListInfo(IMAPResponse paramIMAPResponse)
    throws ParsingException
  {
    String[] arrayOfString = paramIMAPResponse.readSimpleList();
    Vector localVector = new Vector();
    int i;
    if (arrayOfString != null)
    {
      i = 0;
      if (i < arrayOfString.length);
    }
    else
    {
      this.attrs = new String[localVector.size()];
      localVector.copyInto(this.attrs);
      paramIMAPResponse.skipSpaces();
      if (paramIMAPResponse.readByte() != 34)
        break label238;
      char c = (char)paramIMAPResponse.readByte();
      this.separator = c;
      if (c == '\\')
        this.separator = ((char)paramIMAPResponse.readByte());
      paramIMAPResponse.skip(1);
    }
    while (true)
    {
      paramIMAPResponse.skipSpaces();
      this.name = paramIMAPResponse.readAtomString();
      this.name = BASE64MailboxDecoder.decode(this.name);
      return;
      if (arrayOfString[i].equalsIgnoreCase("\\Marked"))
        this.changeState = 1;
      while (true)
      {
        localVector.addElement(arrayOfString[i]);
        i++;
        break;
        if (arrayOfString[i].equalsIgnoreCase("\\Unmarked"))
          this.changeState = 2;
        else if (arrayOfString[i].equalsIgnoreCase("\\Noselect"))
          this.canOpen = false;
        else if (arrayOfString[i].equalsIgnoreCase("\\Noinferiors"))
          this.hasInferiors = false;
      }
      label238: paramIMAPResponse.skip(2);
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.protocol.ListInfo
 * JD-Core Version:    0.6.2
 */