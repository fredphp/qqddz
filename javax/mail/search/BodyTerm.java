package javax.mail.search;

import javax.mail.Message;
import javax.mail.Multipart;
import javax.mail.Part;

public final class BodyTerm extends StringTerm
{
  private static final long serialVersionUID = -4888862527916911385L;

  public BodyTerm(String paramString)
  {
    super(paramString);
  }

  private boolean matchPart(Part paramPart)
  {
    int i;
    int j;
    try
    {
      if (paramPart.isMimeType("text/*"))
      {
        String str = (String)paramPart.getContent();
        if (str == null)
          return false;
        return super.match(str);
      }
      if (paramPart.isMimeType("multipart/*"))
      {
        Multipart localMultipart = (Multipart)paramPart.getContent();
        i = localMultipart.getCount();
        j = 0;
        break label118;
        if (!matchPart(localMultipart.getBodyPart(j)))
          break label127;
        return true;
      }
      else
      {
        if (!paramPart.isMimeType("message/rfc822"))
          break label125;
        boolean bool = matchPart((Part)paramPart.getContent());
        return bool;
      }
    }
    catch (Exception localException)
    {
    }
    label118: 
    while (j >= i)
    {
      label125: return false;
      label127: j++;
    }
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof BodyTerm))
      return false;
    return super.equals(paramObject);
  }

  public boolean match(Message paramMessage)
  {
    return matchPart(paramMessage);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.search.BodyTerm
 * JD-Core Version:    0.6.2
 */