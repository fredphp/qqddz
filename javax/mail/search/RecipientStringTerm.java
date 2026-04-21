package javax.mail.search;

import javax.mail.Address;
import javax.mail.Message;
import javax.mail.Message.RecipientType;

public final class RecipientStringTerm extends AddressStringTerm
{
  private static final long serialVersionUID = -8293562089611618849L;
  private Message.RecipientType type;

  public RecipientStringTerm(Message.RecipientType paramRecipientType, String paramString)
  {
    super(paramString);
    this.type = paramRecipientType;
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof RecipientStringTerm));
    while ((!((RecipientStringTerm)paramObject).type.equals(this.type)) || (!super.equals(paramObject)))
      return false;
    return true;
  }

  public Message.RecipientType getRecipientType()
  {
    return this.type;
  }

  public int hashCode()
  {
    return this.type.hashCode() + super.hashCode();
  }

  public boolean match(Message paramMessage)
  {
    Address[] arrayOfAddress;
    try
    {
      arrayOfAddress = paramMessage.getRecipients(this.type);
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
 * Qualified Name:     javax.mail.search.RecipientStringTerm
 * JD-Core Version:    0.6.2
 */