package javax.mail.search;

import javax.mail.Address;
import javax.mail.Message;

public final class FromTerm extends AddressTerm
{
  private static final long serialVersionUID = 5214730291502658665L;

  public FromTerm(Address paramAddress)
  {
    super(paramAddress);
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof FromTerm))
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
 * Qualified Name:     javax.mail.search.FromTerm
 * JD-Core Version:    0.6.2
 */