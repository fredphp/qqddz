package javax.mail.search;

import java.util.Date;

public abstract class DateTerm extends ComparisonTerm
{
  private static final long serialVersionUID = 4818873430063720043L;
  protected Date date;

  protected DateTerm(int paramInt, Date paramDate)
  {
    this.comparison = paramInt;
    this.date = paramDate;
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof DateTerm));
    while ((!((DateTerm)paramObject).date.equals(this.date)) || (!super.equals(paramObject)))
      return false;
    return true;
  }

  public int getComparison()
  {
    return this.comparison;
  }

  public Date getDate()
  {
    return new Date(this.date.getTime());
  }

  public int hashCode()
  {
    return this.date.hashCode() + super.hashCode();
  }

  protected boolean match(Date paramDate)
  {
    switch (this.comparison)
    {
    default:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    }
    do
    {
      do
      {
        do
          return false;
        while ((!paramDate.before(this.date)) && (!paramDate.equals(this.date)));
        return true;
        return paramDate.before(this.date);
        return paramDate.equals(this.date);
      }
      while (paramDate.equals(this.date));
      return true;
      return paramDate.after(this.date);
    }
    while ((!paramDate.after(this.date)) && (!paramDate.equals(this.date)));
    return true;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.search.DateTerm
 * JD-Core Version:    0.6.2
 */