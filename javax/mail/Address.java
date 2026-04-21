package javax.mail;

import java.io.Serializable;

public abstract class Address
  implements Serializable
{
  private static final long serialVersionUID = -5822459626751992278L;

  public abstract boolean equals(Object paramObject);

  public abstract String getType();

  public abstract String toString();
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.Address
 * JD-Core Version:    0.6.2
 */