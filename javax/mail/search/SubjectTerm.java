package javax.mail.search;

import javax.mail.Message;

public final class SubjectTerm extends StringTerm
{
  private static final long serialVersionUID = 7481568618055573432L;

  public SubjectTerm(String paramString)
  {
    super(paramString);
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof SubjectTerm))
      return false;
    return super.equals(paramObject);
  }

  public boolean match(Message paramMessage)
  {
    String str;
    try
    {
      str = paramMessage.getSubject();
      if (str == null)
        return false;
    }
    catch (Exception localException)
    {
      return false;
    }
    return super.match(str);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.search.SubjectTerm
 * JD-Core Version:    0.6.2
 */