package javax.mail.search;

import javax.mail.Address;
import javax.mail.Message;

public final class FromStringTerm extends AddressStringTerm
{
  private static final long serialVersionUID = 5801127523826772788L;

  public FromStringTerm(String paramString)
  {
    super(paramString);
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof FromStringTerm))
      return false;
    return super.equals(paramObject);
  }

  public boolean match(Message paramMessage)
  {
    Address[] arrayOfAddress;
    try
    {
      arrayOfAddress = paramMessage.getFrom();
      if (arrayOfAddress == null)
        return false;
    }
    catch (Exception localException)
    {
      return false;
    }
    for (int i = 0; i < arrayOfAddress.length; i++)
      if (super.match(arrayOfAddress[i]))
        return true;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.search.FromStringTerm
 * JD-Core Version:    0.6.2
 */