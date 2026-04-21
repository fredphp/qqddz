package javax.mail.internet;

public class ContentDisposition
{
  private String disposition;
  private ParameterList list;

  public ContentDisposition()
  {
  }

  public ContentDisposition(String paramString)
    throws ParseException
  {
    HeaderTokenizer localHeaderTokenizer = new HeaderTokenizer(paramString, "()<>@,;:\\\"\t []/?=");
    HeaderTokenizer.Token localToken = localHeaderTokenizer.next();
    if (localToken.getType() != -1)
      throw new ParseException();
    this.disposition = localToken.getValue();
    String str = localHeaderTokenizer.getRemainder();
    if (str != null)
      this.list = new ParameterList(str);
  }

  public ContentDisposition(String paramString, ParameterList paramParameterList)
  {
    this.disposition = paramString;
    this.list = paramParameterList;
  }

  public String getDisposition()
  {
    return this.disposition;
  }

  public String getParameter(String paramString)
  {
    if (this.list == null)
      return null;
    return this.list.get(paramString);
  }

  public ParameterList getParameterList()
  {
    return this.list;
  }

  public void setDisposition(String paramString)
  {
    this.disposition = paramString;
  }

  public void setParameter(String paramString1, String paramString2)
  {
    if (this.list == null)
      this.list = new ParameterList();
    this.list.set(paramString1, paramString2);
  }

  public void setParameterList(ParameterList paramParameterList)
  {
    this.list = paramParameterList;
  }

  public String toString()
  {
    if (this.disposition == null)
      return null;
    if (this.list == null)
      return this.disposition;
    StringBuffer localStringBuffer = new StringBuffer(this.disposition);
    localStringBuffer.append(this.list.toString(21 + localStringBuffer.length()));
    return localStringBuffer.toString();
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.internet.ContentDisposition
 * JD-Core Version:    0.6.2
 */