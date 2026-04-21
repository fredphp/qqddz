package javax.mail.internet;

public class ContentType
{
  private ParameterList list;
  private String primaryType;
  private String subType;

  public ContentType()
  {
  }

  public ContentType(String paramString)
    throws ParseException
  {
    HeaderTokenizer localHeaderTokenizer = new HeaderTokenizer(paramString, "()<>@,;:\\\"\t []/?=");
    HeaderTokenizer.Token localToken1 = localHeaderTokenizer.next();
    if (localToken1.getType() != -1)
      throw new ParseException();
    this.primaryType = localToken1.getValue();
    if ((char)localHeaderTokenizer.next().getType() != '/')
      throw new ParseException();
    HeaderTokenizer.Token localToken2 = localHeaderTokenizer.next();
    if (localToken2.getType() != -1)
      throw new ParseException();
    this.subType = localToken2.getValue();
    String str = localHeaderTokenizer.getRemainder();
    if (str != null)
      this.list = new ParameterList(str);
  }

  public ContentType(String paramString1, String paramString2, ParameterList paramParameterList)
  {
    this.primaryType = paramString1;
    this.subType = paramString2;
    this.list = paramParameterList;
  }

  public String getBaseType()
  {
    return this.primaryType + '/' + this.subType;
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

  public String getPrimaryType()
  {
    return this.primaryType;
  }

  public String getSubType()
  {
    return this.subType;
  }

  public boolean match(String paramString)
  {
    try
    {
      boolean bool = match(new ContentType(paramString));
      return bool;
    }
    catch (ParseException localParseException)
    {
    }
    return false;
  }

  public boolean match(ContentType paramContentType)
  {
    if (!this.primaryType.equalsIgnoreCase(paramContentType.getPrimaryType()));
    String str;
    do
    {
      return false;
      str = paramContentType.getSubType();
      if ((this.subType.charAt(0) == '*') || (str.charAt(0) == '*'))
        return true;
    }
    while (!this.subType.equalsIgnoreCase(str));
    return true;
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

  public void setPrimaryType(String paramString)
  {
    this.primaryType = paramString;
  }

  public void setSubType(String paramString)
  {
    this.subType = paramString;
  }

  public String toString()
  {
    if ((this.primaryType == null) || (this.subType == null))
      return null;
    StringBuffer localStringBuffer = new StringBuffer();
    localStringBuffer.append(this.primaryType).append('/').append(this.subType);
    if (this.list != null)
      localStringBuffer.append(this.list.toString(14 + localStringBuffer.length()));
    return localStringBuffer.toString();
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.internet.ContentType
 * JD-Core Version:    0.6.2
 */