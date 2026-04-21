package javax.mail.search;

import java.util.Locale;
import javax.mail.Message;

public final class HeaderTerm extends StringTerm
{
  private static final long serialVersionUID = 8342514650333389122L;
  protected String headerName;

  public HeaderTerm(String paramString1, String paramString2)
  {
    super(paramString2);
    this.headerName = paramString1;
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof HeaderTerm));
    HeaderTerm localHeaderTerm;
    do
    {
      return false;
      localHeaderTerm = (HeaderTerm)paramObject;
    }
    while ((!localHeaderTerm.headerName.equalsIgnoreCase(this.headerName)) || (!super.equals(localHeaderTerm)));
    return true;
  }

  public String getHeaderName()
  {
    return this.headerName;
  }

  public int hashCode()
  {
    return this.headerName.toLowerCase(Locale.ENGLISH).hashCode() + super.hashCode();
  }

  public boolean match(Message paramMessage)
  {
    String[] arrayOfString;
    try
    {
      arrayOfString = paramMessage.getHeader(this.headerName);
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
 * Qualified Name:     javax.mail.search.HeaderTerm
 * JD-Core Version:    0.6.2
 */