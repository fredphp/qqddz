package com.sun.activation.registries;

public class MimeTypeEntry
{
  private String extension;
  private String type;

  public MimeTypeEntry(String paramString1, String paramString2)
  {
    this.type = paramString1;
    this.extension = paramString2;
  }

  public String getFileExtension()
  {
    return this.extension;
  }

  public String getMIMEType()
  {
    return this.type;
  }

  public String toString()
  {
    return "MIMETypeEntry: " + this.type + ", " + this.extension;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.activation.registries.MimeTypeEntry
 * JD-Core Version:    0.6.2
 */