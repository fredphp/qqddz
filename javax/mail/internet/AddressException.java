package javax.mail.internet;

public class AddressException extends ParseException
{
  private static final long serialVersionUID = 9134583443539323120L;
  protected int pos = -1;
  protected String ref = null;

  public AddressException()
  {
  }

  public AddressException(String paramString)
  {
    super(paramString);
  }

  public AddressException(String paramString1, String paramString2)
  {
    super(paramString1);
    this.ref = paramString2;
  }

  public AddressException(String paramString1, String paramString2, int paramInt)
  {
    super(paramString1);
    this.ref = paramString2;
    this.pos = paramInt;
  }

  public int getPos()
  {
    return this.pos;
  }

  public String getRef()
  {
    return this.ref;
  }

  public String toString()
  {
    String str1 = super.toString();
    if (this.ref == null)
      return str1;
    String str2 = str1 + " in string ``" + this.ref + "''";
    if (this.pos < 0)
      return str2;
    return str2 + " at position " + this.pos;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.internet.AddressException
 * JD-Core Version:    0.6.2
 */