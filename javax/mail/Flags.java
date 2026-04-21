package javax.mail;

import java.io.Serializable;
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Locale;
import java.util.Vector;

public class Flags
  implements Cloneable, Serializable
{
  private static final int ANSWERED_BIT = 1;
  private static final int DELETED_BIT = 2;
  private static final int DRAFT_BIT = 4;
  private static final int FLAGGED_BIT = 8;
  private static final int RECENT_BIT = 16;
  private static final int SEEN_BIT = 32;
  private static final int USER_BIT = -2147483648;
  private static final long serialVersionUID = 6243590407214169028L;
  private int system_flags = 0;
  private Hashtable user_flags = null;

  public Flags()
  {
  }

  public Flags(String paramString)
  {
    this.user_flags = new Hashtable(1);
    this.user_flags.put(paramString.toLowerCase(Locale.ENGLISH), paramString);
  }

  public Flags(Flag paramFlag)
  {
    this.system_flags |= paramFlag.bit;
  }

  public Flags(Flags paramFlags)
  {
    this.system_flags = paramFlags.system_flags;
    if (paramFlags.user_flags != null)
      this.user_flags = ((Hashtable)paramFlags.user_flags.clone());
  }

  public void add(String paramString)
  {
    if (this.user_flags == null)
      this.user_flags = new Hashtable(1);
    this.user_flags.put(paramString.toLowerCase(Locale.ENGLISH), paramString);
  }

  public void add(Flag paramFlag)
  {
    this.system_flags |= paramFlag.bit;
  }

  public void add(Flags paramFlags)
  {
    this.system_flags |= paramFlags.system_flags;
    Enumeration localEnumeration;
    if (paramFlags.user_flags != null)
    {
      if (this.user_flags == null)
        this.user_flags = new Hashtable(1);
      localEnumeration = paramFlags.user_flags.keys();
    }
    while (true)
    {
      if (!localEnumeration.hasMoreElements())
        return;
      String str = (String)localEnumeration.nextElement();
      this.user_flags.put(str, paramFlags.user_flags.get(str));
    }
  }

  public Object clone()
  {
    try
    {
      localFlags = (Flags)super.clone();
      if ((this.user_flags != null) && (localFlags != null))
        localFlags.user_flags = ((Hashtable)this.user_flags.clone());
      return localFlags;
    }
    catch (CloneNotSupportedException localCloneNotSupportedException)
    {
      while (true)
        Flags localFlags = null;
    }
  }

  public boolean contains(String paramString)
  {
    if (this.user_flags == null)
      return false;
    return this.user_flags.containsKey(paramString.toLowerCase(Locale.ENGLISH));
  }

  public boolean contains(Flag paramFlag)
  {
    return (this.system_flags & paramFlag.bit) != 0;
  }

  public boolean contains(Flags paramFlags)
  {
    if ((paramFlags.system_flags & this.system_flags) != paramFlags.system_flags);
    do
    {
      return false;
      if (paramFlags.user_flags == null)
        break;
    }
    while (this.user_flags == null);
    Enumeration localEnumeration = paramFlags.user_flags.keys();
    do
      if (!localEnumeration.hasMoreElements())
        return true;
    while (this.user_flags.containsKey(localEnumeration.nextElement()));
    return false;
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof Flags));
    Flags localFlags;
    do
    {
      do
      {
        return false;
        localFlags = (Flags)paramObject;
      }
      while (localFlags.system_flags != this.system_flags);
      if ((localFlags.user_flags == null) && (this.user_flags == null))
        return true;
    }
    while ((localFlags.user_flags == null) || (this.user_flags == null) || (localFlags.user_flags.size() != this.user_flags.size()));
    Enumeration localEnumeration = localFlags.user_flags.keys();
    do
      if (!localEnumeration.hasMoreElements())
        return true;
    while (this.user_flags.containsKey(localEnumeration.nextElement()));
    return false;
  }

  public Flag[] getSystemFlags()
  {
    Vector localVector = new Vector();
    if ((0x1 & this.system_flags) != 0)
      localVector.addElement(Flag.ANSWERED);
    if ((0x2 & this.system_flags) != 0)
      localVector.addElement(Flag.DELETED);
    if ((0x4 & this.system_flags) != 0)
      localVector.addElement(Flag.DRAFT);
    if ((0x8 & this.system_flags) != 0)
      localVector.addElement(Flag.FLAGGED);
    if ((0x10 & this.system_flags) != 0)
      localVector.addElement(Flag.RECENT);
    if ((0x20 & this.system_flags) != 0)
      localVector.addElement(Flag.SEEN);
    if ((0x80000000 & this.system_flags) != 0)
      localVector.addElement(Flag.USER);
    Flag[] arrayOfFlag = new Flag[localVector.size()];
    localVector.copyInto(arrayOfFlag);
    return arrayOfFlag;
  }

  public String[] getUserFlags()
  {
    Vector localVector = new Vector();
    Enumeration localEnumeration;
    if (this.user_flags != null)
      localEnumeration = this.user_flags.elements();
    while (true)
    {
      if (!localEnumeration.hasMoreElements())
      {
        String[] arrayOfString = new String[localVector.size()];
        localVector.copyInto(arrayOfString);
        return arrayOfString;
      }
      localVector.addElement(localEnumeration.nextElement());
    }
  }

  public int hashCode()
  {
    int i = this.system_flags;
    Enumeration localEnumeration;
    if (this.user_flags != null)
      localEnumeration = this.user_flags.keys();
    while (true)
    {
      if (!localEnumeration.hasMoreElements())
        return i;
      i += ((String)localEnumeration.nextElement()).hashCode();
    }
  }

  public void remove(String paramString)
  {
    if (this.user_flags != null)
      this.user_flags.remove(paramString.toLowerCase(Locale.ENGLISH));
  }

  public void remove(Flag paramFlag)
  {
    this.system_flags &= (0xFFFFFFFF ^ paramFlag.bit);
  }

  public void remove(Flags paramFlags)
  {
    this.system_flags &= (0xFFFFFFFF ^ paramFlags.system_flags);
    if ((paramFlags.user_flags == null) || (this.user_flags == null));
    while (true)
    {
      return;
      Enumeration localEnumeration = paramFlags.user_flags.keys();
      while (localEnumeration.hasMoreElements())
        this.user_flags.remove(localEnumeration.nextElement());
    }
  }

  public static final class Flag
  {
    public static final Flag ANSWERED = new Flag(1);
    public static final Flag DELETED = new Flag(2);
    public static final Flag DRAFT = new Flag(4);
    public static final Flag FLAGGED = new Flag(8);
    public static final Flag RECENT = new Flag(16);
    public static final Flag SEEN = new Flag(32);
    public static final Flag USER = new Flag(-2147483648);
    private int bit;

    private Flag(int paramInt)
    {
      this.bit = paramInt;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.Flags
 * JD-Core Version:    0.6.2
 */