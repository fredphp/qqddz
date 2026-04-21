package javax.mail.search;

import javax.mail.Message;

public final class AndTerm extends SearchTerm
{
  private static final long serialVersionUID = -3583274505380989582L;
  protected SearchTerm[] terms;

  public AndTerm(SearchTerm paramSearchTerm1, SearchTerm paramSearchTerm2)
  {
    this.terms = new SearchTerm[2];
    this.terms[0] = paramSearchTerm1;
    this.terms[1] = paramSearchTerm2;
  }

  public AndTerm(SearchTerm[] paramArrayOfSearchTerm)
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
    if (!(paramObject instanceof AndTerm));
    AndTerm localAndTerm;
    do
    {
      return false;
      localAndTerm = (AndTerm)paramObject;
    }
    while (localAndTerm.terms.length != this.terms.length);
    for (int i = 0; ; i++)
    {
      if (i >= this.terms.length)
        return true;
      if (!this.terms[i].equals(localAndTerm.terms[i]))
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
        return true;
      if (!this.terms[i].match(paramMessage))
        return false;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.search.AndTerm
 * JD-Core Version:    0.6.2
 */