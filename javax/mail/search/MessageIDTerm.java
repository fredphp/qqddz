package javax.mail.search;

import javax.mail.Message;

public final class MessageIDTerm extends StringTerm
{
  private static final long serialVersionUID = -2121096296454691963L;

  public MessageIDTerm(String paramString)
  {
    super(paramString);
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof MessageIDTerm))
      return false;
    return super.equals(paramObject);
  }

  public boolean match(Message paramMessage)
  {
    String[] arrayOfString;
    try
    {
      arrayOfString = paramMessage.getHeader("Message-ID");
      if (arrayOfString == null)
        return false;
    }
    catch (Exception localException)
    {
      return false;
    }
    for (int i = 0; i < arrayOfString.length; i++)
      if (super.match(arrayOfString[i]))
        return true;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.search.MessageIDTerm
 * JD-Core Version:    0.6.2
 */