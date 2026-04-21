package javax.mail.search;

public abstract class StringTerm extends SearchTerm
{
  private static final long serialVersionUID = 1274042129007696269L;
  protected boolean ignoreCase;
  protected String pattern;

  protected StringTerm(String paramString)
  {
    this.pattern = paramString;
    this.ignoreCase = true;
  }

  protected StringTerm(String paramString, boolean paramBoolean)
  {
    this.pattern = paramString;
    this.ignoreCase = paramBoolean;
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof StringTerm));
    StringTerm localStringTerm;
    do
    {
      do
      {
        return false;
        localStringTerm = (StringTerm)paramObject;
        if (!this.ignoreCase)
          break;
      }
      while ((!localStringTerm.pattern.equalsIgnoreCase(this.pattern)) || (localStringTerm.ignoreCase != this.ignoreCase));
      return true;
    }
    while ((!localStringTerm.pattern.equals(this.pattern)) || (localStringTerm.ignoreCase != this.ignoreCase));
    return true;
  }

  public boolean getIgnoreCase()
  {
    return this.ignoreCase;
  }

  public String getPattern()
  {
    return this.pattern;
  }

  public int hashCode()
  {
    if (this.ignoreCase)
      return this.pattern.hashCode();
    return 0xFFFFFFFF ^ this.pattern.hashCode();
  }

  protected boolean match(String paramString)
  {
    int i = paramString.length() - this.pattern.length();
    for (int j = 0; ; j++)
    {
      if (j > i)
        return false;
      if (paramString.regionMatches(this.ignoreCase, j, this.pattern, 0, this.pattern.length()))
        return true;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.search.StringTerm
 * JD-Core Version:    0.6.2
 */