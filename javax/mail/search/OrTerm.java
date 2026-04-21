package javax.mail.search;

import javax.mail.Message;

public final class OrTerm extends SearchTerm
{
  private static final long serialVersionUID = 5380534067523646936L;
  protected SearchTerm[] terms;

  public OrTerm(SearchTerm paramSearchTerm1, SearchTerm paramSearchTerm2)
  {
    this.terms = new SearchTerm[2];
    this.terms[0] = paramSearchTerm1;
    this.terms[1] = paramSearchTerm2;
  }

  public OrTerm(SearchTerm[] paramArrayOfSearchTerm)
  {
    this.terms = new SearchTerm[paramArrayOfSearchTerm.length];
    for (int i = 0; ; i++)
    {
      if (i >= paramArrayOfSearchTerm.length)
        return;
      this.terms[i] = paramArrayOfSearchTerm[i];
    }
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof OrTerm));
    OrTerm localOrTerm;
    do
    {
      return false;
      localOrTerm = (OrTerm)paramObject;
    }
    while (localOrTerm.terms.length != this.terms.length);
    for (int i = 0; ; i++)
    {
      if (i >= this.terms.length)
        return true;
      if (!this.terms[i].equals(localOrTerm.terms[i]))
        break;
    }
  }

  public SearchTerm[] getTerms()
  {
    return (SearchTerm[])this.terms.clone();
  }

  public int hashCode()
  {
    int i = 0;
    for (int j = 0; ; j++)
    {
      if (j >= this.terms.length)
        return i;
      i += this.terms[j].hashCode();
    }
  }

  public boolean match(Message paramMessage)
  {
    for (int i = 0; ; i++)
    {
      if (i >= this.terms.length)
        return false;
      if (this.terms[i].match(paramMessage))
        return true;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.search.OrTerm
 * JD-Core Version:    0.6.2
 */