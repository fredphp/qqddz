package javax.activation;

import java.io.Externalizable;
import java.io.IOException;
import java.io.ObjectInput;
import java.io.ObjectOutput;
import java.util.Locale;

public class MimeType
  implements Externalizable
{
  private static final String TSPECIALS = "()<>@,;:/[]?=\\\"";
  private MimeTypeParameterList parameters;
  private String primaryType;
  private String subType;

  public MimeType()
  {
    this.primaryType = "application";
    this.subType = "*";
    this.parameters = new MimeTypeParameterList();
  }

  public MimeType(String paramString)
    throws MimeTypeParseException
  {
    parse(paramString);
  }

  public MimeType(String paramString1, String paramString2)
    throws MimeTypeParseException
  {
    if (isValidToken(paramString1))
    {
      this.primaryType = paramString1.toLowerCase(Locale.ENGLISH);
      if (isValidToken(paramString2))
      {
        this.subType = paramString2.toLowerCase(Locale.ENGLISH);
        this.parameters = new MimeTypeParameterList();
      }
    }
    else
    {
      throw new MimeTypeParseException("Primary type is invalid.");
    }
    throw new MimeTypeParseException("Sub type is invalid.");
  }

  private static boolean isTokenChar(char paramChar)
  {
    return (paramChar > ' ') && (paramChar < '') && ("()<>@,;:/[]?=\\\"".indexOf(paramChar) < 0);
  }

  private boolean isValidToken(String paramString)
  {
    int i = paramString.length();
    boolean bool1 = false;
    if (i > 0);
    for (int j = 0; ; j++)
    {
      if (j >= i)
        bool1 = true;
      boolean bool2;
      do
      {
        return bool1;
        bool2 = isTokenChar(paramString.charAt(j));
        bool1 = false;
      }
      while (!bool2);
    }
  }

  private void parse(String paramString)
    throws MimeTypeParseException
  {
    int i = paramString.indexOf('/');
    int j = paramString.indexOf(';');
    if ((i < 0) && (j < 0))
      throw new MimeTypeParseException("Unable to find a sub type.");
    if ((i < 0) && (j >= 0))
      throw new MimeTypeParseException("Unable to find a sub type.");
    if ((i >= 0) && (j < 0))
    {
      this.primaryType = paramString.substring(0, i).trim().toLowerCase(Locale.ENGLISH);
      this.subType = paramString.substring(i + 1).trim().toLowerCase(Locale.ENGLISH);
      this.parameters = new MimeTypeParameterList();
    }
    while (!isValidToken(this.primaryType))
    {
      throw new MimeTypeParseException("Primary type is invalid.");
      if (i < j)
      {
        this.primaryType = paramString.substring(0, i).trim().toLowerCase(Locale.ENGLISH);
        this.subType = paramString.substring(i + 1, j).trim().toLowerCase(Locale.ENGLISH);
        this.parameters = new MimeTypeParameterList(paramString.substring(j));
      }
      else
      {
        throw new MimeTypeParseException("Unable to find a sub type.");
      }
    }
    if (!isValidToken(this.subType))
      throw new MimeTypeParseException("Sub type is invalid.");
  }

  public String getBaseType()
  {
    return this.primaryType + "/" + this.subType;
  }

  public String getParameter(String paramString)
  {
    return this.parameters.get(paramString);
  }

  public MimeTypeParameterList getParameters()
  {
    return this.parameters;
  }

  public String getPrimaryType()
  {
    return this.primaryType;
  }

  public String getSubType()
  {
    return this.subType;
  }

  public boolean match(String paramString)
    throws MimeTypeParseException
  {
    return match(new MimeType(paramString));
  }

  public boolean match(MimeType paramMimeType)
  {
    return (this.primaryType.equals(paramMimeType.getPrimaryType())) && ((this.subType.equals("*")) || (paramMimeType.getSubType().equals("*")) || (this.subType.equals(paramMimeType.getSubType())));
  }

  public void readExternal(ObjectInput paramObjectInput)
    throws IOException, ClassNotFoundException
  {
    try
    {
      parse(paramObjectInput.readUTF());
      return;
    }
    catch (MimeTypeParseException localMimeTypeParseException)
    {
      throw new IOException(localMimeTypeParseException.toString());
    }
  }

  public void removeParameter(String paramString)
  {
    this.parameters.remove(paramString);
  }

  public void setParameter(String paramString1, String paramString2)
  {
    this.parameters.set(paramString1, paramString2);
  }

  public void setPrimaryType(String paramString)
    throws MimeTypeParseException
  {
    if (!isValidToken(this.primaryType))
      throw new MimeTypeParseException("Primary type is invalid.");
    this.primaryType = paramString.toLowerCase(Locale.ENGLISH);
  }

  public void setSubType(String paramString)
    throws MimeTypeParseException
  {
    if (!isValidToken(this.subType))
      throw new MimeTypeParseException("Sub type is invalid.");
    this.subType = paramString.toLowerCase(Locale.ENGLISH);
  }

  public String toString()
  {
    return getBaseType() + this.parameters.toString();
  }

  public void writeExternal(ObjectOutput paramObjectOutput)
    throws IOException
  {
    paramObjectOutput.writeUTF(toString());
    paramObjectOutput.flush();
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.activation.MimeType
 * JD-Core Version:    0.6.2
 */