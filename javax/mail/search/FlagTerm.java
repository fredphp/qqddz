package javax.mail.search;

import javax.mail.Flags;
import javax.mail.Flags.Flag;
import javax.mail.Message;

public final class FlagTerm extends SearchTerm
{
  private static final long serialVersionUID = -142991500302030647L;
  protected Flags flags;
  protected boolean set;

  public FlagTerm(Flags paramFlags, boolean paramBoolean)
  {
    this.flags = paramFlags;
    this.set = paramBoolean;
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof FlagTerm));
    FlagTerm localFlagTerm;
    do
    {
      return false;
      localFlagTerm = (FlagTerm)paramObject;
    }
    while ((localFlagTerm.set != this.set) || (!localFlagTerm.flags.equals(this.flags)));
    return true;
  }

  public Flags getFlags()
  {
    return (Flags)this.flags.clone();
  }

  public boolean getTestSet()
  {
    return this.set;
  }

  public int hashCode()
  {
    if (this.set)
      return this.flags.hashCode();
    return 0xFFFFFFFF ^ this.flags.hashCode();
  }

  public boolean match(Message paramMessage)
  {
    boolean bool1 = true;
    try
    {
      Flags localFlags = paramMessage.getFlags();
      if (this.set)
      {
        if (!localFlags.contains(this.flags))
          break label120;
        return bool1;
      }
      Flags.Flag[] arrayOfFlag = this.flags.getSystemFlags();
      int i = 0;
      String[] arrayOfString;
      if (i >= arrayOfFlag.length)
        arrayOfString = this.flags.getUserFlags();
      for (int j = 0; ; j++)
      {
        if (j >= arrayOfString.length)
          break label118;
        if (localFlags.contains(arrayOfString[j]))
        {
          return false;
          boolean bool2 = localFlags.contains(arrayOfFlag[i]);
          if (bool2)
            return false;
          i++;
          break;
        }
      }
    }
    catch (Exception localException)
    {
      bool1 = false;
    }
    label118: return bool1;
    label120: return false;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.search.FlagTerm
 * JD-Core Version:    0.6.2
 */