package javax.mail;

public class Quota
{
  public String quotaRoot;
  public Resource[] resources;

  public Quota(String paramString)
  {
    this.quotaRoot = paramString;
  }

  public void setResourceLimit(String paramString, long paramLong)
  {
    if (this.resources == null)
    {
      this.resources = new Resource[1];
      this.resources[0] = new Resource(paramString, 0L, paramLong);
      return;
    }
    for (int i = 0; ; i++)
    {
      if (i >= this.resources.length)
      {
        Resource[] arrayOfResource = new Resource[1 + this.resources.length];
        System.arraycopy(this.resources, 0, arrayOfResource, 0, this.resources.length);
        arrayOfResource[(-1 + arrayOfResource.length)] = new Resource(paramString, 0L, paramLong);
        this.resources = arrayOfResource;
        return;
      }
      if (this.resources[i].name.equalsIgnoreCase(paramString))
      {
        this.resources[i].limit = paramLong;
        return;
      }
    }
  }

  public static class Resource
  {
    public long limit;
    public String name;
    public long usage;

    public Resource(String paramString, long paramLong1, long paramLong2)
    {
      this.name = paramString;
      this.usage = paramLong1;
      this.limit = paramLong2;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.Quota
 * JD-Core Version:    0.6.2
 */