from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


# Association table for many-to-many relationship between guests and events
event_guests = Table(
    'event_guests',
    Base.metadata,
    Column('event_id', Integer, ForeignKey('events.id', ondelete='CASCADE'), primary_key=True),
    Column('guest_id', Integer, ForeignKey('guests.id', ondelete='CASCADE'), primary_key=True),
    Column('created_at', DateTime(timezone=True), server_default=func.now())
)


class Guest(Base):
    """
    Guest model for storing guest information.
    Guests can be invited to multiple events.
    """
    __tablename__ = "guests"

    id = Column(Integer, primary_key=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    
    # Address information
    street = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True)
    
    # Dietary preferences and restrictions
    intolerances = Column(String(1000), nullable=True)  # e.g., "lactose, gluten, nuts"
    favorites = Column(String(1000), nullable=True)  # e.g., "pasta, seafood, chocolate"
    dietary_notes = Column(String(2000), nullable=True)  # Additional notes
    
    # Image
    image_path = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    events = relationship("Event", secondary=event_guests, back_populates="guests")

    def __repr__(self):
        return f"<Guest(id={self.id}, name='{self.first_name} {self.last_name}')>"


# Made with Bob