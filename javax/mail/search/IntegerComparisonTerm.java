package javax.mail.search;

public abstract class IntegerComparisonTerm extends ComparisonTerm
{
  private static final long serialVersionUID = -6963571240154302484L;
  protected int number;

  protected IntegerComparisonTerm(int paramInt1, int paramInt2)
  {
    this.comparison = paramInt1;
    this.number = paramInt2;
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof IntegerComparisonTerm));
    while ((((IntegerComparisonTerm)paramObject).number != this.number) || (!super.equals(paramObject)))
      return false;
    return true;
  }

  public int getComparison()
  {
    return this.comparison;
  }

  public int getNumber()
  {
    return this.number;
  }

  public int hashCode()
  {
    return this.number + super.hashCode();
  }

  protected boolean match(int paramInt)
  {
    boolean bool = true;
    switch (this.comparison)
    {
    default:
      bool = false;
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
        {
          do
          {
            do
            {
              do
                return bool;
              while (paramInt <= this.number);
              return false;
            }
            while (paramInt < this.number);
            return false;
          }
          while (paramInt == this.number);
          return false;
        }
        while (paramInt != this.number);
        return false;
      }
      while (paramInt > this.number);
      return false;
    }
    while (paramInt >= this.number);
    return false;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.search.IntegerComparisonTerm
 * JD-Core Version:    0.6.2
 */