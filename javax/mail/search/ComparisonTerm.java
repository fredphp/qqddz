package javax.mail.search;

public abstract class ComparisonTerm extends SearchTerm
{
  public static final int EQ = 3;
  public static final int GE = 6;
  public static final int GT = 5;
  public static final int LE = 1;
  public static final int LT = 2;
  public static final int NE = 4;
  private static final long serialVersionUID = 1456646953666474308L;
  protected int comparison;

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof ComparisonTerm));
    while (((ComparisonTerm)paramObject).comparison != this.comparison)
      return false;
    return true;
  }

  public int hashCode()
  {
    return this.comparison;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.search.ComparisonTerm
 * JD-Core Version:    0.6.2
 */