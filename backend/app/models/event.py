from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Event(Base):
    """
    Event model for storing cooking events.
    """
    __tablename__ = "events"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(String(2000), nullable=True)
    theme = Column(String(100), nullable=True)
    event_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    participants = relationship("EventParticipant", back_populates="event", cascade="all, delete-orphan")
    courses = relationship("EventCourse", back_populates="event", cascade="all, delete-orphan")
    shopping_lists = relationship("ShoppingList", back_populates="event", cascade="all, delete-orphan")
    guests = relationship("Guest", secondary="event_guests", back_populates="events")

    def __repr__(self):
        return f"<Event(id={self.id}, name='{self.name}')>"


class EventParticipant(Base):
    """
    Event participant model for storing event participants.
    """
    __tablename__ = "event_participants"

    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    name = Column(String(255), nullable=False)
    dietary_restrictions = Column(String(1000), nullable=True)

    # Relationships
    event = relationship("Event", back_populates="participants")

    def __repr__(self):
        return f"<EventParticipant(id={self.id}, name='{self.name}')>"


class EventCourse(Base):
    """
    Event course model for storing courses in an event.
    """
    __tablename__ = "event_courses"

    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    course_number = Column(Integer, nullable=False)
    course_name = Column(String(255), nullable=False)

    # Relationships
    event = relationship("Event", back_populates="courses")
    recipes = relationship("CourseRecipe", back_populates="course", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<EventCourse(id={self.id}, course_number={self.course_number}, name='{self.course_name}')>"


class CourseRecipe(Base):
    """
    Course recipe model for linking recipes to courses.
    """
    __tablename__ = "course_recipes"

    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey("event_courses.id"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)

    # Relationships
    course = relationship("EventCourse", back_populates="recipes")
    recipe = relationship("Recipe")

    def __repr__(self):
        return f"<CourseRecipe(course_id={self.course_id}, recipe_id={self.recipe_id})>"


# Made with Bob
