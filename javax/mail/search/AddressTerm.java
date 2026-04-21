package javax.mail.search;

import javax.mail.Address;

public abstract class AddressTerm extends SearchTerm
{
  private static final long serialVersionUID = 2005405551929769980L;
  protected Address address;

  protected AddressTerm(Address paramAddress)
  {
    this.address = paramAddress;
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof AddressTerm))
      return false;
    return ((AddressTerm)paramObject).address.equals(this.address);
  }

  public Address getAddress()
  {
    return this.address;
  }

  public int hashCode()
  {
    return this.address.hashCode();
  }

  protected boolean match(Address paramAddress)
  {
    return paramAddress.equals(this.address);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.search.AddressTerm
 * JD-Core Version:    0.6.2
 */