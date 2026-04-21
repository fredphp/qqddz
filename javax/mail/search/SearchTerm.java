package javax.mail.search;

import java.io.Serializable;
import javax.mail.Message;

public abstract class SearchTerm
  implements Serializable
{
  private static final long serialVersionUID = -6652358452205992789L;

  public abstract boolean match(Message paramMessage);
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.search.SearchTerm
 * JD-Core Version:    0.6.2
 */