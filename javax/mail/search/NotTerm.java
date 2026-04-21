package javax.mail.search;

import javax.mail.Message;

public final class NotTerm extends SearchTerm
{
  private static final long serialVersionUID = 7152293214217310216L;
  protected SearchTerm term;

  public NotTerm(SearchTerm paramSearchTerm)
  {
    this.term = paramSearchTerm;
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof NotTerm))
      return false;
    return ((NotTerm)paramObject).term.equals(this.term);
  }

  public SearchTerm getTerm()
  {
    return this.term;
  }

  public int hashCode()
  {
    return this.term.hashCode() << 1;
  }

  public boolean match(Message paramMessage)
  {
    return !this.term.match(paramMessage);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.search.NotTerm
 * JD-Core Version:    0.6.2
 */